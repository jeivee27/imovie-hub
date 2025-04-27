const API_KEY = '2fc7b3876456eb119074d7db7ab5a65a'; // <--- Replace this with your real TMDB API KEY
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentMovieId = null;
let currentType = 'movie';

// 🌗 Dark/Light Mode Toggle
const themeButton = document.getElementById('themeToggle');
let isDark = true;
themeButton.addEventListener('click', () => {
  if (isDark) {
    document.body.style.backgroundColor = '#f4f4f4';
    document.body.style.color = '#111';
    themeButton.innerText = '☀️ Light Mode';
    document.querySelector('.navbar').style.backgroundColor = '#e0e0e0';
    document.querySelector('.footer').style.backgroundColor = '#e0e0e0';
    document.getElementById('searchResults').style.background = 'rgba(0, 0, 0, 0.05)';
  } else {
    document.body.style.backgroundColor = '#121212';
    document.body.style.color = '#fff';
    themeButton.innerText = '🌙 Dark Mode';
    document.querySelector('.navbar').style.backgroundColor = '#1f1f1f';
    document.querySelector('.footer').style.backgroundColor = '#1f1f1f';
    document.getElementById('searchResults').style.background = 'rgba(255, 255, 255, 0.05)';
  }
  isDark = !isDark;
});

// 🎬 Open Player Modal
function openPlayer(id, type = 'movie') {
  launchPopAd(); // 🚀 Smart delayed PopAd triggered here

  currentMovieId = id;
  currentType = type;
  const iframe = document.getElementById('player-iframe');
  const spinner = document.getElementById('loading-spinner');
  const modal = document.getElementById('player-modal');

  spinner.style.display = 'flex';
  iframe.style.display = 'none';

  const server = document.getElementById('server-selector').value;
  iframe.src = buildPlayerURL(server, id, type);

  iframe.onload = () => {
    spinner.style.display = 'none';
    iframe.style.display = 'block';
  };

  modal.style.display = 'flex';
}

// ❌ Close Player
function closePlayer() {
  const modal = document.getElementById('player-modal');
  const iframe = document.getElementById('player-iframe');
  modal.style.display = 'none';
  iframe.src = '';
}

// 🔄 Change Server
function changeServer() {
  const iframe = document.getElementById('player-iframe');
  const server = document.getElementById('server-selector').value;
  iframe.src = buildPlayerURL(server, currentMovieId, currentType);
}

// 🛠 Build Correct Player URL
function buildPlayerURL(server, id, type) {
  if (server === '2embed.to') {
    return type === 'movie'
      ? `https://www.2embed.to/embed/tmdb/movie?id=${id}`
      : `https://www.2embed.to/embed/tmdb/tv?id=${id}`;
  } else {
    return type === 'movie'
      ? `https://${server}/embed/movie/${id}`
      : `https://${server}/embed/tv/${id}`;
  }
}

// 🎥 Fetch Trending Movies
async function fetchTrendingMovies() {
  const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`);
  const data = await res.json();
  const list = document.getElementById('movies-list');
  data.results.forEach(movie => createMovieCard(movie, list, 'movie'));
}

// 📺 Fetch Trending TV Shows
async function fetchTrendingTV() {
  const res = await fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}`);
  const data = await res.json();
  const list = document.getElementById('tvshows-list');
  data.results.forEach(tv => createMovieCard(tv, list, 'tv'));
}

// 🎎 Fetch Trending Anime
async function fetchTrendingAnime() {
  const res = await fetch(`https://api.jikan.moe/v4/top/anime`);
  const data = await res.json();
  const list = document.getElementById('anime-list');
  data.data.forEach(anime => createAnimeCard(anime, list));
}

// 🖼 Create Movie/TV Poster
function createMovieCard(item, list, type) {
  const imgBox = document.createElement('div');
  imgBox.style.position = 'relative';
  imgBox.style.display = 'inline-block';

  const img = document.createElement('img');
  img.src = IMG_URL + item.poster_path;
  img.alt = item.title || item.name;
  img.onclick = () => openPlayer(item.id, type);

  const favBtn = document.createElement('button');
  favBtn.innerHTML = '❤️';
  favBtn.style.position = 'absolute';
  favBtn.style.top = '8px';
  favBtn.style.right = '8px';
  favBtn.style.background = 'rgba(0,0,0,0.5)';
  favBtn.style.border = 'none';
  favBtn.style.borderRadius = '50%';
  favBtn.style.padding = '5px';
  favBtn.style.color = 'white';
  favBtn.style.cursor = 'pointer';
  favBtn.title = 'Add to Favorites';

  favBtn.onclick = (e) => {
    e.stopPropagation();
    addToFavorites(item, type);
  };

  imgBox.appendChild(img);
  imgBox.appendChild(favBtn);
  list.appendChild(imgBox);
}

// 🖼 Create Anime Poster
function createAnimeCard(anime, list) {
  const img = document.createElement('img');
  img.src = anime.images.jpg.image_url;
  img.alt = anime.title;
  img.onclick = () => openPlayer(anime.mal_id, 'anime');
  list.appendChild(img);
}

// ❤️ Save to Favorites
function addToFavorites(item, type) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.find(m => m.id === item.id)) {
    favorites.push({ id: item.id, poster_path: item.poster_path, title: item.title || item.name, type });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Added to Favorites!');
    loadFavorites();
  } else {
    alert('Already in Favorites!');
  }
}

// 📃 Load Favorites
function loadFavorites() {
  const favoritesList = document.getElementById('favorites-list');
  favoritesList.innerHTML = '';

  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites.forEach(movie => {
    const imgBox = document.createElement('div');
    imgBox.style.position = 'relative';
    imgBox.style.display = 'inline-block';

    const img = document.createElement('img');
    img.src = IMG_URL + movie.poster_path;
    img.alt = movie.title;
    img.onclick = () => openPlayer(movie.id, movie.type);

    imgBox.appendChild(img);
    favoritesList.appendChild(imgBox);
  });
}

// 🔍 Live Search
async function searchTMDB() {
  const query = document.getElementById('searchInput').value.trim();
  const resultsBox = document.getElementById('searchResults');

  if (query.length < 2) {
    resultsBox.style.display = 'none';
    resultsBox.innerHTML = '';
    return;
  }

  const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  const data = await res.json();

  resultsBox.innerHTML = '';
  data.results.slice(0, 10).forEach(item => {
    if (item.poster_path) {
      const resultItem = document.createElement('div');
      resultItem.style.padding = '10px';
      resultItem.style.cursor = 'pointer';
      resultItem.style.display = 'flex';
      resultItem.style.alignItems = 'center';
      resultItem.style.borderBottom = '1px solid #333';

      const img = document.createElement('img');
      img.src = IMG_URL + item.poster_path;
      img.style.width = '40px';
      img.style.height = '60px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '5px';
      img.style.marginRight = '10px';

      const title = document.createElement('span');
      title.innerText = item.title || item.name || 'No Title';
      title.style.fontSize = '14px';
      title.style.color = '#fff';

      resultItem.appendChild(img);
      resultItem.appendChild(title);
      resultItem.onclick = () => openPlayer(item.id, item.media_type);

      resultsBox.appendChild(resultItem);
    }
  });

  resultsBox.classList.add('show');
  resultsBox.style.display = 'block';
}

// 🎯 Keyboard Navigation in Search
let searchIndex = -1;
document.addEventListener('keydown', function(e) {
  const resultsBox = document.getElementById('searchResults');
  const items = resultsBox.querySelectorAll('div');

  if (resultsBox.style.display === 'block' && items.length > 0) {
    if (e.key === "ArrowDown") {
      searchIndex = (searchIndex + 1) % items.length;
      highlightResult(items);
    } else if (e.key === "ArrowUp") {
      searchIndex = (searchIndex - 1 + items.length) % items.length;
      highlightResult(items);
    } else if (e.key === "Enter") {
      if (searchIndex >= 0) {
        items[searchIndex].click();
      }
    }
  }
});

function highlightResult(items) {
  items.forEach((item, index) => {
    item.style.background = index === searchIndex ? 'rgba(255,255,255,0.2)' : 'transparent';
  });
}

// ❌ Close search if clicking outside
document.addEventListener('click', function(event) {
  const searchBox = document.getElementById('searchInput');
  const resultsBox = document.getElementById('searchResults');
  if (!searchBox.contains(event.target) && !resultsBox.contains(event.target)) {
    resultsBox.style.display = 'none';
    resultsBox.classList.remove('show');
    searchIndex = -1;
  }
});

// 🚀 Load Banner Trailer
async function loadBannerTrailer() {
  const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`);
  const data = await res.json();
  const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
  const res2 = await fetch(`https://api.themoviedb.org/3/movie/${randomMovie.id}/videos?api_key=${API_KEY}`);
  const videos = await res2.json();
  const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  const bannerVideo = document.getElementById('banner-video');
  const bannerTitle = document.getElementById('banner-title');

  if (trailer) {
    bannerVideo.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&loop=1&playlist=${trailer.key}&controls=0&showinfo=0&modestbranding=1&playsinline=1`;
    bannerVideo.style.display = 'block';
    bannerTitle.innerText = randomMovie.title || randomMovie.name || "Premium Movies";
  } else {
    bannerTitle.innerText = randomMovie.title || "Premium Movies";
  }
}

// 🚀 Smart Delayed PopAd
function launchPopAd() {
  setTimeout(() => {
    var h = "fed6e471b4c88049ce9a5b28346f6a05",
        o = [
          "d3d3LmNkbjRhZHMuY29tL3dibHVlaW1wLWdhbGxlcnkubWluLmNzcw==",
          "ZDNnNW92Zm5nanc5YncuY2xvdWRm9udC5uZXQvci9jY2lyY2xlcy5taW4uanM="
        ],
        b = -1, p, v;

    function d() {
      clearTimeout(p);
      b++;
      if (o[b] && !(1771658868000 < (new Date).getTime() && 1 < b)) {
        v = document.createElement("script");
        v.type = "text/javascript";
        v.async = true;
        v.src = "https://" + atob(o[b]);
        v.crossOrigin = "anonymous";
        v.onerror = d;
        document.getElementsByTagName("head")[0].appendChild(v);
      }
    }

    d();
  }, 5000); // Delay 5 seconds after click
}

// 🚀 Start App
fetchTrendingMovies();
fetchTrendingTV();
fetchTrendingAnime();
loadFavorites();
loadBannerTrailer();
