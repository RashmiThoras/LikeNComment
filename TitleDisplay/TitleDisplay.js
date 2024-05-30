let TitleElement = document.getElementById("DisplayTitleTask");
let buttonElement = document.getElementById("DisplayBtn");
let urlArray = [
    'https://www.linkedin.com/in/williamhgates/',
    'https://www.linkedin.com/in/sundarpichai/',
    'https://www.linkedin.com/in/satyanadella/'
];
let currentindex = 0;


buttonElement.onclick = function() {
    for(i=0; i<urlArray.length; i++) {
    chrome.tabs.create({ url: urlArray[i] });
    chrome.tabs.query({ active: true, currentWindow: true }, callback);
}}

function callback(tabs) {
    var currentTab = tabs[0];
    console.log('Current Tab:', currentTab);
    chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
            let scrapedProfileData = {
                name: "",
                url:"",
                about: "",
                bio: "",
                location: "",
                followerCount: "",
                connectionCount: ""
            };

            function grabData(currentindex, urlArray) {
                console.log("Inside grabData");
                alert("Inside grabData");

                const anchors = document.querySelectorAll('a');
                console.log("Anchors found:", anchors.length);

                // Scrape name
                if (!scrapedProfileData.name) {
                    console.log("Scraping name...");
                    for (let anchor of anchors) {
                        if (anchor.getAttribute('href').endsWith('/overlay/about-this-profile/')) {
                            let childH1 = anchor.querySelector('h1');
                            if (childH1) {
                                scrapedProfileData.name = childH1.innerText;
                                alert("Name found: " + scrapedProfileData.name);
                                console.log("Name found:", scrapedProfileData.name);
                                break;
                            }
                        }
                    }
                }

                // Scrape location
                if (!scrapedProfileData.location) {
                    console.log("Scraping location...");
                    for (let anchor of anchors) {
                        if (anchor.getAttribute('href').endsWith('/overlay/contact-info/')) {
                            let parentElement = anchor.parentElement;
                            if (parentElement) {
                                let siblingSpan = parentElement.previousElementSibling;
                                if (siblingSpan && siblingSpan.tagName === 'SPAN') {
                                    scrapedProfileData.location = siblingSpan.innerText;
                                    alert("Location found: " + scrapedProfileData.location);
                                    console.log("Location found:", scrapedProfileData.location);
                                    break;
                                }
                            }
                        }
                    }
                }

                // Scrape follower count
                if (!scrapedProfileData.followerCount) {
                    console.log("Scraping follower count...");
                    let followerListItems = document.querySelectorAll('li');
                    for (let listItem of followerListItems) {
                        if (listItem.innerText.includes("followers")) {
                            let firstSpan = listItem.querySelector('span');
                            if (firstSpan) {
                                scrapedProfileData.followerCount = firstSpan.innerText.replace(/,/g, '');
                                console.log("Follower count found:", scrapedProfileData.followerCount);
                                alert("Follower count found: " + scrapedProfileData.followerCount);
                                break;
                            }
                        }
                    }
                }

                // Check if all fields are populated
                if (scrapedProfileData.name && scrapedProfileData.location && scrapedProfileData.followerCount) {
                    console.log('All data collected:', scrapedProfileData);
                    alert(`All data collected: Name: ${scrapedProfileData.name}, Location: ${scrapedProfileData.location}, Followers: ${scrapedProfileData.followerCount}`);
                    scrapedProfileData.url = window.location.href;
                    scrapedProfileData.about = "";
                    scrapedProfileData.bio = "";
                    scrapedProfileData.connectionCount="0",
                    sendProfileData(scrapedProfileData);  // Send data to backend
                } else {
                    alert('Data collection incomplete. Retrying...');
                    setTimeout(grabData, 5000);  // Retry after 5 seconds
                }
            }

            function sendProfileData(userData) {
                
                alert('Sending User data: ' + JSON.stringify(userData));
                fetch('http://localhost:3000/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('User data saved successfully:', data);
                })
                .catch((error) => {
                    console.error('Error saving User data:', error);
                });
            }

            console.log("Initial grabData call with delay");
            setTimeout(grabData, 5000);  // Initial call to grab data after 5 seconds
        }
    });
}
