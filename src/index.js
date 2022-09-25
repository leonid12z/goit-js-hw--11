import './css/styles.css';

import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '29954646-db9f7822c777c12d459ddab9a';
const BASE_URL = 'https://pixabay.com/api/?key=';
const PER_PAGE =
  '}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40';

const searchForm = document.querySelector('.search-form');
const loadMoreBtn = document.querySelector('.load-more');
const hitsContainerGallery = document.querySelector('.gallery');

let page = 1;
let searchQuery = '';
loadMoreBtn.style.display = 'none';
let total = 0;

let gallery = new SimpleLightbox('.gallery a', { captionsData: 'alt' });

searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

function onSearch(e) {
  e.preventDefault();
  searchQuery = e.currentTarget.elements.searchQuery.value;
  hitsContainerGallery.innerHTML = '';
  total = 0;

  if (searchQuery !== '') {
    page = 1;
    onLoadMore();
  }
}

function onLoadMore() {
  loadMoreBtn.style.display = 'none';
  getPhotos(searchQuery).then(array => {
    photoCard(array.hits);
    loadMoreBtn.style.display = 'block';
    forScrollPage();
    if (page === 2) {
      Notify.success(`Hooray! We found ${array.totalHits} images.`);
    }
  });
  page += 1;
}

function forScrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function photoCard(photos) {
  const markup = photos
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
      <div class="photo-card">
      <a href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" max-width="400px" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b><br>${likes}</br>
    </p>
    <p class="info-item">
      <b>Views</b><br>${views}</br>
    </p>
    <p class="info-item">
      <b>Comments</b><br>${comments}</br>
    </p>
    <p class="info-item">
      <b>Downloads</b><br>${downloads}</br>
    </p>
  </div>
</div>
      `;
      }
    )
    .join('');
  hitsContainerGallery.insertAdjacentHTML('beforeend', markup);
  gallery.refresh();
}

async function getPhotos(name) {
  try {
    const response = await axios.get
      (BASE_URL + API_KEY + `&q=${name}` + PER_PAGE + `&page=${page}`);
    
    total += response.data.hits.length;
    const totalHits = response.data.totalHits;
    if (total >= totalHits) {
      Notify.warning(
        'We`re sorry, but you`ve reached the end of search results.'
      );
      loadMoreBtn.style.display = 'none';
    }
    return response.data;
  } catch (error) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

