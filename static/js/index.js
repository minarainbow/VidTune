window.HELP_IMPROVE_VIDEOJS = false;


$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
			slidesToScroll: 1,
			slidesToShow: 1,
			loop: true,
			infinite: true,
			autoplay: true,
			autoplaySpeed: 5000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();

    // Initialize video examples
    initializeVideoExamples();
    
    // Add click listener to mute when clicking outside video containers
    document.addEventListener('click', function(e) {
        // Check if click is outside any video wrapper and not on a button
        const clickedVideoWrapper = e.target.closest('.video-wrapper');
        const clickedButton = e.target.closest('.audio-toggle-button');
        if (!clickedVideoWrapper && !clickedButton && currentlyPlayingVideo) {
            muteCurrentVideo();
        }
    });
})

// Keep track of currently playing video
let currentlyPlayingVideo = null;
let currentlyPlayingAudio = null;
let currentlyPlayingButton = null;

// Toggle audio on/off for video examples
function toggleAudio(button) {
    const videoWrapper = button.closest('.video-wrapper');
    if (!videoWrapper) return;
    
    const video = videoWrapper.querySelector('.example-video');
    const audio = videoWrapper.querySelector('.example-audio');
    
    if (!video || !audio) return;
    
    // Get icon reference - query fresh each time we need it
    let icon = button.querySelector('i');
    
    // If this video is already playing and unmuted, mute it and keep video playing
    if (currentlyPlayingVideo === video && !audio.paused) {
        audio.pause();
        // Directly replace button's innerHTML
        button.innerHTML = '<i class="fas fa-volume-mute"></i>';
        button.classList.remove('audio-on');
        currentlyPlayingVideo = null;
        currentlyPlayingAudio = null;
        currentlyPlayingButton = null;
        // Resume all other videos
        document.querySelectorAll('.example-video').forEach(v => {
            if (v !== video) {
                v.play().catch(e => {
                    // Ignore AbortError - it's harmless when play is interrupted
                    if (e.name !== 'AbortError') {
                        console.log('Video resume failed:', e);
                    }
                });
            }
        });
        // Remove paused state from all videos
        document.querySelectorAll('.video-wrapper').forEach(w => {
            w.classList.remove('video-paused');
        });
        return;
    }
    
    // Pause all other videos
    document.querySelectorAll('.example-video').forEach(v => {
        if (v !== video) {
            v.pause();
        }
    });
    
    // Pause all other audio
    document.querySelectorAll('.example-audio').forEach(a => {
        if (a !== audio) {
            a.pause();
        }
    });
    
    // Reset all other buttons
    document.querySelectorAll('.audio-toggle-button').forEach(b => {
        if (b !== button) {
            // Directly replace button's innerHTML
            b.innerHTML = '<i class="fas fa-volume-mute"></i>';
            b.classList.remove('audio-on');
        }
    });
    
    // Play this video and unmute audio
    video.play().catch(e => console.log('Video play failed:', e));
    audio.currentTime = video.currentTime;
    audio.play().catch(e => console.log('Audio play failed:', e));
    
    // Update icon - directly replace button's innerHTML
    button.innerHTML = '<i class="fas fa-volume-up"></i>';
    
    button.classList.add('audio-on');
    
    // Update video states for visual feedback
    updateVideoStates(video);
    
    currentlyPlayingVideo = video;
    currentlyPlayingAudio = audio;
    currentlyPlayingButton = button;
}

// Update visual states of all videos (add filter to paused ones)
function updateVideoStates(playingVideo) {
    document.querySelectorAll('.example-video').forEach(v => {
        const wrapper = v.closest('.video-wrapper');
        if (v === playingVideo) {
            wrapper.classList.remove('video-paused');
        } else {
            wrapper.classList.add('video-paused');
        }
    });
}

// Mute currently playing video when clicking outside
function muteCurrentVideo() {
    if (currentlyPlayingVideo && currentlyPlayingAudio && currentlyPlayingButton) {
        currentlyPlayingAudio.pause();
        // Directly replace button's innerHTML
        currentlyPlayingButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        currentlyPlayingButton.classList.remove('audio-on');
        
        // Resume all videos
        document.querySelectorAll('.example-video').forEach(v => {
            v.play().catch(e => {
                // Ignore AbortError - it's harmless when play is interrupted
                if (e.name !== 'AbortError') {
                    console.log('Video resume failed:', e);
                }
            });
        });
        
        // Remove paused state from all videos
        document.querySelectorAll('.video-wrapper').forEach(w => {
            w.classList.remove('video-paused');
        });
        
        currentlyPlayingVideo = null;
        currentlyPlayingAudio = null;
        currentlyPlayingButton = null;
    }
}

// Initialize video examples - all playing muted by default
function initializeVideoExamples() {
    const videoWrappers = document.querySelectorAll('.video-wrapper');
    
    videoWrappers.forEach(wrapper => {
        const video = wrapper.querySelector('.example-video');
        const audio = wrapper.querySelector('.example-audio');
        
        // Set video to autoplay, loop, and muted
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        
        // Set audio to loop (only if audio element exists)
        if (audio) {
            audio.loop = true;
            
            // Ensure audio is paused initially
            audio.pause();
            audio.currentTime = 0;
            
            // Sync audio with video when playing
            video.addEventListener('play', function() {
                if (!audio.paused && currentlyPlayingAudio === audio) {
                    audio.currentTime = video.currentTime;
                    audio.play().catch(e => console.log('Audio sync play failed:', e));
                }
            });
            
            video.addEventListener('timeupdate', function() {
                if (!audio.paused && currentlyPlayingAudio === audio) {
                    // Keep audio in sync with video
                    if (Math.abs(audio.currentTime - video.currentTime) > 0.2) {
                        audio.currentTime = video.currentTime;
                    }
                }
            });
        }
        
        // Start all videos playing (muted)
        video.play().catch(e => console.log('Video autoplay failed:', e));
        
        // When video ends (shouldn't happen with loop, but just in case)
        video.addEventListener('ended', function() {
            if (video.loop) {
                video.currentTime = 0;
                video.play();
            }
        });
    });
}
