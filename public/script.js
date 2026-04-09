var player    = document.getElementById('player');
var filter    = document.getElementById('filter');
var clickbar  = document.getElementById('clickbar');
var bottombar = document.querySelector('.bottombar');
var shuffle   = 0;
var current   = mapping_full[0];
var previous  = current;
var songs     = songs_full;
var mapping   = mapping_full;
var metadata;

// Media Session API stuff
if('mediaSession' in navigator) {
    // Hook up the hardware buttons
    navigator.mediaSession.setActionHandler('previoustrack', prev);
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('play', pause);
    navigator.mediaSession.setActionHandler('pause', pause);
}

async function get_metadata(name) {
    const response = await fetch("meta?file=" + encodeURIComponent(name));
    metadata = await response.json();
    set_title();

    // Set metadata (shows on car display / lock screen)
    if('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: metadata.title,
            artist: metadata.artist,
            album: metadata.album,
            artwork: [{ src: metadata.cover }]
        });
        console.log("art: " + metadata.cover);
    }
}

function set_title() {
    var title = metadata.artist + " - " + metadata.title;
    if(player.paused) title += " (Paused)";
    document.title = title;
}

function play(song) {
    if(document.getElementById("link" + previous)) {
        document.getElementById("link" + previous).classList.remove("current");
    }
    document.getElementById("link" + song).classList.add("current");
    previous = shuffle ? mapping[current] : current;
    var name = songs[song]
    document.getElementById("playing").innerHTML = name;
    player.src = "media/" + name;
    player.load();
    if('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
    }
    player.play();
    document.getElementById("pause").innerHTML = '<i class="fa fa-pause-circle fa-3x"></i>';
    get_metadata(name);
}

function click(i) {
    current = shuffle ? mapping.indexOf(i) : i;
    play(i);
}

function toggle_shuffle() {
    if(shuffle) {
        current = mapping[current];
        shuffle = 0;
        document.getElementById("shuffle").style.color = "#fff";
        document.getElementById("shuffle").title = "Shuffle is off";
    } else {
        current = mapping.indexOf(current);
        shuffle = 1;
        document.getElementById("shuffle").style.color = "#f50";
        document.getElementById("shuffle").title = "Shuffle is on";
    }
}

function next() {
    current = (current + 1) % songs.length;
    play(shuffle ? mapping[current] : current);
}

function prev() {
    current = (current - 1 + songs.length) % songs.length;
    play(shuffle ? mapping[current] : current);
}

function pause() {
    var silence = document.getElementById('silence');
    var icon = document.getElementById('pause');
    if(player.paused) {
        player.play();
        silence.play();
        icon.innerHTML = '<i class="fa fa-pause-circle fa-3x"></i>';
        if('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
        }
    } else {
        player.pause();
        silence.pause();
        icon.innerHTML = '<i class="fa fa-play-circle fa-3x"></i>';
        if('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
    }
    set_title();
}

function seconds_to_timer(sec) {
    var minutes = Math.floor(sec / 60);
    var seconds = Math.floor(sec % 60);
    if(seconds < 10) {
        seconds = "0" + seconds;
    }
    return minutes + ":" + seconds;
}

function create_links() {
    var string = filter.value;
    songs = songs_full.filter(item => item.toLowerCase().includes(string.toLowerCase()));
    mapping = mapping_full.filter(item => item < songs.length);
    document.getElementById("links").innerHTML = songs.map(
        (song, i) => `<a class="song" id="link${i}" href="javascript:click(${i})">${song}</a><br />`
    ).join('\n');
}

document.addEventListener('keydown', function(event) {
    if(document.activeElement == filter) return;

    if(event.key == ' ') {
        event.preventDefault(); // don't type a space or scroll down the page
        pause();
    }
    if(event.key == '/') {
        event.preventDefault(); // prevents the "/" from being typed into whatever else is focused
        bottombar.classList.remove('collapsed');
        filter.focus();
        filter.select();
    }
});

document.addEventListener('mousemove', function(event) {
    var popup = document.getElementById('floating_time');
    popup.style.left = event.pageX - popup.clientWidth / 2 + "px";
    popup.style.top = event.pageY - popup.clientHeight - 10 + "px";
    popup.innerHTML = seconds_to_timer(player.duration * event.offsetX / clickbar.clientWidth);
});

player.addEventListener('ended', next);

filter.addEventListener('change', create_links);

filter.addEventListener('keydown', function(event) {
    if(event.key == 'Enter')  event.target.blur();
    if(event.key == 'Escape') event.target.blur();
});

filter.addEventListener('blur', function() {
    bottombar.classList.add('collapsed');
});

bottombar.addEventListener('click', function() {
    bottombar.classList.remove('collapsed');
    filter.focus();
    filter.select();
});

clickbar.addEventListener('click', function(event) {
    player.currentTime = player.duration * event.offsetX / clickbar.clientWidth;
});

clickbar.addEventListener('mouseover', function() {
    document.getElementById('floating_time').style.display='block';
});

clickbar.addEventListener('mouseout', function() {
    document.getElementById('floating_time').style.display='none';
});

setInterval(function() {
    if(player.readyState > 0) {
        document.getElementById("end_time").innerHTML = seconds_to_timer(player.duration);
        document.getElementById("current_time").innerHTML = seconds_to_timer(player.currentTime);
        document.getElementById("scrubbar").style.width = 100 * player.currentTime / player.duration + "%";
    }
}, 200);

window.onload = function() {
    create_links();
    var name = songs[current]
    document.getElementById("playing").innerHTML = name;
    player.src = "media/" + name;
};
