const URL = "http://localhost:3000/tweets";
let nextPageUrl = null;


const onEnter = (event) => {
    // Checks if "Enter" key has been pressed in the input element
    if(event.key === 'Enter') {
        getTwitterData();
    }
}

const onNextPage = () => {
    if(nextPageUrl) {
        getTwitterData(true);
    }
}

/**
 * Retrive Twitter Data from API
 */
const getTwitterData = (nextPage=false) => {
        const query = document.getElementById('search-input').value;
        
        // makes sure query is not an empty string to prevent error
        if(!query) return;
        const encodedQuery = encodeURIComponent(query);
        let FULL_URL = `http://localhost:3000/tweets?q=${encodedQuery}&count=10`;
        if(nextPage && nextPageUrl) {
            FULL_URL = nextPageUrl;
        }

        // Get tweets from backend API
        const tweets = fetch(FULL_URL).then((response) => {
            return response.json()
        }).then((data) => {
            buildTweets(data.statuses, nextPage);
            saveNextPage(data.search_metadata);
            nextPageButtonVisibility(data.search_metadata);
        });
}

/**
 * Save the next page data
 */
const saveNextPage = (metadata) => {
    if(metadata.next_results) {
        nextPageUrl = `${URL}${metadata.next_results}`;
    } else {
        nextPageUrl = null; // resetting the value to null as soon as there aren't anymore tweets
    }
}

/**
 * Handle when a user clicks on a trend
 */
const selectTrend = (event) => {
    const hashtag = event.target.innerText;
    document.getElementById('search-input').value = hashtag;
    getTwitterData();
}

/**
 * Set the visibility of next page based on if there is data on next page
 */
const nextPageButtonVisibility = (metadata) => {
    if(metadata.next_results) {
        document.querySelector('.next-page-container').style.visibility = 'visible';
    } else {
        document.querySelector('.next-page-container').style.visibility = 'hidden';
    }
    
}

/**
 * Build Tweets HTML based on Data from API
 */
const buildTweets = (tweets, nextPage) => {
    let newHTML = '';
    tweets.map((tweet) => {
        const createdDate = moment(tweet.created_at).fromNow();
        newHTML += `
        <div class="individual-tweet-container">
            <div class="tweet-user-info">
                <div class="tweet-user-profile-pic" style="background-image: url('${tweet.user.profile_image_url_https}');"></div>
                <div class="tweet-username-container">
                    <div class="tweet-user-fullname">${tweet.user.name}</div>
                    <div class="tweet-user-username">@${tweet.user.screen_name}</div>
                </div>
            </div>
            `
        
            if(tweet.extended_entities && tweet.extended_entities.media.length > 0) {
                newHTML += buildImages(tweet.extended_entities.media);
                newHTML += buildVideo(tweet.extended_entities.media);
            }
        
            newHTML += ` 
            <div class="tweet-text-container">
                ${tweet.full_text}
            </div>
            <div class="tweet-date-container">
                ${createdDate}
            </div>
        </div>
        `
    })

    if(nextPage) {
        let htmlObject = document.createElement('div');
        htmlObject.innerHTML = newHTML;
        document.getElementsByClassName('tweets-list')[0].insertAdjacentElement('beforeend', htmlObject);
    } else {
        document.getElementsByClassName('tweets-list')[0].innerHTML = newHTML;
    }
}

/**
 * Build HTML for Tweets Images
 */
const buildImages = (mediaList) => {
    let ImagesContent = `<div class="tweet-images-container">`;
    let ImageExists = false;
    mediaList.map((media_obj) => {
        if(media_obj.type === 'photo') {
            ImageExists = true;
            ImagesContent += `
            <div class="tweet-image" style="background-image: url('${media_obj.media_url_https}')"></div>
            `
        }
    });
    ImagesContent += `</div>`
    return ImageExists ? ImagesContent: '';
}

/**
 * Build HTML for Tweets Video
 */
const buildVideo = (mediaList) => {
    let VideosContent = `<div class="tweet-video-container">`;
    let VideoExists = false;
    mediaList.map((media_obj) => {
        if(media_obj.type === 'video') {
            VideoExists = true;
            const videoVariant = media_obj.video_info.variants.find((variant) => variant.content_type === 'video/mp4');
            VideosContent += `
            <video controls>
                <source src="${videoVariant.url}" type="video/mp4">
            </video>
            `
        }else if(media_obj.type === 'animated_gif') {
            VideoExists = true;
            const videoVariant = media_obj.video_info.variants.find((variant) => variant.content_type === 'video/mp4');
            VideosContent += `
            <video loop autoplay>
                <source src="${videoVariant.url}" type="video/mp4">
            </video>
            `
        }
    });
    VideosContent += `</div>`
    return VideoExists ? VideosContent: '';
}
