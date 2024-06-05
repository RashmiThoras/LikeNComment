let buttonElement = document.getElementById("DisplayBtn");
let likeCountElement = document.getElementById('likeCount');
let commentCountElement = document.getElementById('commentCount');

buttonElement.disabled = true;

function enableButton() {
    const likeCount = likeCountElement.value;
    const commentCount = commentCountElement.value;
    if (parseInt(likeCount) > 0 && parseInt(commentCount) > 0) {
        buttonElement.disabled = false;
    } else {
        buttonElement.disabled = true;
    }
}

likeCountElement.addEventListener('input', enableButton);
commentCountElement.addEventListener('input', enableButton);

buttonElement.onclick = function() {
    chrome.tabs.create({ url: 'https://www.linkedin.com/feed/' });
    chrome.tabs.query({ active: true, currentWindow: true }, callback);
}

function callback(tabs) {
    var currentTab = tabs[0];
    console.log('Current Tab:', currentTab);

    chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: LikeAndComment,
        args: [parseInt(likeCountElement.value), parseInt(commentCountElement.value)]
    });
}

function LikeAndComment(likeCount, commentCount) {
    console.log("Inside LikeAndComment");

    let Lc = 0;
    let Cc = 0;

    function LikePosts() {
        let likeButtons = document.querySelectorAll('.feed-shared-social-action-bar__action-button .react-button__trigger');
        
        function likeNextPost() {
            if (Lc < likeCount && Lc < likeButtons.length) {
                likeButtons[Lc].click();
                alert(`Liked post number: ${Lc + 1}`);
                Lc++;
                setTimeout(likeNextPost, 1000); // Delay between likes
            } else if (Lc >= likeCount) {
                alert('Finished liking posts');
                setTimeout(CommentPosts, 1000); // Start commenting after finishing likes
            } else {
                console.error('Not enough posts to like');
            }
        }
        
        likeNextPost();
    }

    function CommentPosts() {
        alert("in the comment section")
        let commentButtons = document.querySelectorAll('.artdeco-button artdeco-button--muted artdeco-button--4 artdeco-button--tertiary ember-view social-actions-button comment-button flex-wrap ');
        alert("what is in the commentButton" +commentButtons);
        
        function commentNextPost() {
            if (Cc < commentCount && Cc < commentButtons.length) {
                let commentBtn = commentButtons[Cc];
                alert(commentBtn);
                commentBtn.click();

                // Wait a moment to allow the comment box to appear
                setTimeout(() => {
                    let commentBoxes = document.querySelectorAll('.feed-shared-social-actions .comments-comment-box__content .ql-editor p');
                    alert("comment box" + commentBoxes);
                    if (commentBoxes[Cc]) {
                        commentBoxes[Cc].textContent = "CFBR"; // Use textContent to set the text
                        let postButtons = document.querySelectorAll('.feed-shared-social-actions .comments-comment-box__form button[type="submit"]');
                        if (postButtons[Cc]) {
                            postButtons[Cc].click();
                            alert(`Commented on post number: ${Cc + 1}`);
                            Cc++;
                            setTimeout(commentNextPost, 1000); // Delay between comments
                        } else {
                            console.error('Post button not found for comment');
                        }
                    } else {
                        console.error('Comment box not found');
                    }
                }, 1000); // Adjust the delay as necessary
            } else if (Cc >= commentCount) {
                alert('Finished commenting on posts');
            } else {
                console.error('Not enough posts to comment');
            }
        }
        
        commentNextPost();
    }

    setTimeout(() => {
        LikePosts();
    }, 5000); // Initial wait for 5 seconds
}
