let photos = JSON.parse(localStorage.getItem("photos")) || [];
let displayedCards = document.querySelectorAll('.photo-card');
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const newTitle = document.getElementById('j-new-title');
const newCaption = document.getElementById('j-new-caption');
const newFile = document.querySelector('.new-file-input')
const addBtn = document.querySelector('.add-btn');
const viewFavsBtn = document.querySelector('.view-favs-btn');
const showBtn = document.querySelector('.show-btn');
const photoSection = document.querySelector('.photo-section');

const onAddImg = () => {
  const reader = new FileReader();
  if (newFile.files[0] && validType(newFile.files[0])) {
    reader.readAsDataURL(newFile.files[0]); 
    reader.onload = addPhoto;
  } 
}

const onChangeFile = e => {
  if (e.target.classList.contains('change-file-input') && e.target.files[0] && validType(e.target.files[0])) {
    const card = e.target.closest('.photo-card');
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function() {card.querySelector('.photo-img').src = reader.result;}
    findObjByDom(card).updatePhoto(card);
  }
}

const onFormKeyup = () => {
  const totalChars = event.target.value.length;
  const charLimit = parseInt(event.target.nextElementSibling.querySelector('.char-limit').innerText);
  const charCounter = event.target.nextElementSibling.querySelector('.char-count');
  charCounter.innerText = totalChars;
  showErrs(event.target, charLimit);
  updateAddBtn();
}

const onSearchKeyup = () => {
  photoSection.innerHTML = "";
  let searchResults = photos.filter(photo => hasSearchTerms(photo));
  if (viewFavsBtn.innerText === "View All Photos") {
    searchResults = photos.filter(photo => photo.favorite && hasSearchTerms(photo));
  }
  searchResults.forEach(photo => displayCard(photo));
  hideCards();
}

const onViewFavs = () => {
  clearPhotosAndSearch();
  if (viewFavsBtn.innerText !== "View All Photos") {
    viewFavsBtn.innerText = "View All Photos";
    photos.filter(photo => photo.favorite).forEach(photo => displayCard(photo));
    hideCards();
  } else {
    appendAllPhotos(photos);
  }
}

const onAreaClick = e => {
  const card = e.target.closest('.photo-card');
  if (card !== null) {
    findAction(findObjByDom(card), e.target);
  }
}

const onKeypress = e => {
  const key = e.which || e.keyCode;
  if (!validLength(e.target.closest('.photo-card').querySelector('.title-txt').textContent, 30) || !validLength(e.target.closest('.photo-card').querySelector('.caption-txt').textContent, 90)) {
    e.preventDefault();
  } else if (key === 13 && e.target.classList.contains('card-txt')) {
    e.preventDefault();
    const card = e.target.closest('.photo-card');
    findObjByDom(card).updatePhoto(card);
  }
}

const onFocusout = e => {
  if (e.target.classList.contains('card-txt')) {
    const card = e.target.closest('.photo-card');
    findObjByDom(card).updatePhoto(card);
  }
}

const onShow = () => {
  btnAni();
  showBtn.innerText === "Show More..." ? showCards()
  : hideCards();
}

const addPhoto = e => {
  const file = e.target.result;
  const newPhoto = new Photo(Date.now(), newTitle.value, newCaption.value, file, false);
  photos.unshift(newPhoto);
  newPhoto.saveToStorage();
  checkForMrPB(newTitle.value, newCaption.value);
  appendAllPhotos(photos);
  resetForm();
  btnAni();
}

const appendAllPhotos = strArray => {
  if (photos.length === 0) {
    photoSection.innerHTML = `<p class="welcome"><i class="fa fa-arrow-circle-up" aria-hidden="true"></i> Start adding photos using the form above!</p>`;
  } else {
    clearPhotosAndSearch();
    photos = strArray.map(photo => new Photo(photo.id, photo.title, photo.caption, photo.file, photo.favorite));
    photos.forEach(photo => displayCard(photo));
    viewFavsBtn.innerHTML = `View ${photos.filter(photo => photo.favorite).length} Favorites`;
    hideCards();
  }
}
 
const findAction = (photoObj, target) => {
  if (target.classList.contains('delete-btn')) {
    photoObj.deleteFromStorage(target);
  } else if (target.classList.contains('favorite-btn')) {
    toggleFavorite(photoObj, target);
  }
}

const toggleFavorite = (obj, target) => {
  !obj.favorite ? target.classList.add('favorite-btn-active')
  : target.classList.remove('favorite-btn-active');
  obj.updatePhoto(target.closest('.photo-card'));
  updateFavBtnCount();
}

const displayCard = photo => {
  const inputId = Date.now();
  const html = `<article class="photo-card fade-in" data-fav="${photo.favorite}" data-id="${photo.id}">
          <div class="card-main">
            <div class="card-title"><h2 class="card-txt title-txt" id="photo-title" contenteditable="true" aria-live="polite" aria-label="Add text or type / to add or edit photo title" role="textbox">${photo.title}</h2></div>
            <div class="card-photo">
              <label class="change-file-label" for="change-file${inputId}"><img class="photo-img" src="${photo.file}"/></label>
              <input type="file" id="change-file${inputId}" class="change-file-input" accept="image/*">
            </div>
            <div class="card-caption"><p class="card-txt caption-txt" id="photo-caption" contenteditable="true" aria-live="polite" aria-label="Add text or type / to add or edit photo caption">${photo.caption}</p></div>
            </div>
            <div class="card-footer">
              <div class="btn-image delete-btn" aria-role="button" aria-label="Delete this photo" aria-controls="${photo.id}"></div>
              <div class="animated flashit btn-image favorite-btn" aria-role="button" aria-label="Add photo to favorites" aria-controls="${photo.id}">
            </div>
          </div>
        </article>`;
  photoSection.innerHTML += html;
  showFavStatus(photo);
}

const findObjByDom = card => photos.find(photo => photo.id === parseInt(card.dataset.id));

const findDomByObj = objId => document.querySelector(`[data-id="${objId}"]`);

const validLength = (input, limit) => input.length > 0 && input.length <= limit;

const validType = file => (/\.(jpe?g|png|gif)$/i.test(file.name));

const hasSearchTerms = photo => {
  const searchTerms = searchInput.value.toLowerCase();
  return photo.title.toLowerCase().includes(searchTerms) || 
  photo.caption.toLowerCase().includes(searchTerms);
}

const showFavStatus = obj => {
  if (obj.favorite) {
    const favIcon = findDomByObj(obj.id).querySelector('.favorite-btn');
    favIcon.classList.add('favorite-btn-active');
  }
}

const clearPhotosAndSearch = () => {
  photoSection.innerHTML = "";
  searchInput.value = "";
}

const getDisplayedCards = () => Array.from(document.querySelectorAll('.photo-card'));

const hideCards = () => {
  displayedCards = getDisplayedCards();
  const listOfTen = displayedCards.slice(0, 10);
  photoSection.innerHTML = "";
  listOfTen.forEach(card => photoSection.appendChild(card));
  showBtn.innerText = "Show More...";
  updateShowBtn();
}

const showCards = () => {
  photoSection.innerHTML = "";
  displayedCards.forEach(card => photoSection.appendChild(card));
  showBtn.innerText = "Show Less...";
}

const updateShowBtn = () => {
  getDisplayedCards().length < 10 ? showBtn.classList.add('hidden')
  : showBtn.classList.remove('hidden');
}

const updateFavBtnCount = () => {
  if (viewFavsBtn.innerText !== "View All Photos") {
    document.querySelector('.fav-count').innerText = photos.filter(photo => photo.favorite).length;
  }
}

const updateAddBtn = () => {
  document.querySelector('.new-file-input').files[0] && 
  validLength(newTitle.value, 30) && 
  validLength(newCaption.value, 90) ? addBtn.disabled = false
  : addBtn.disabled = true;
}

const showErrs = (input, limit) => {
  input.value.length > 0 && input.value.length <= limit ? 
  input.nextElementSibling.classList.remove('error')
  : input.nextElementSibling.classList.add('error');
}


const resetForm = () => {
  newTitle.value = "";
  newCaption.value = "";
  newFile.value = "";
  searchInput.value = "";
  addBtn.disabled = true;
  const counts = Array.from(document.querySelectorAll('.char-count'));
  counts.forEach(count => count.innerText = "0");
}

const checkForMrPB = (title, body) => {
  if (title.toLowerCase().includes("poopy", "butthole") || 
    body.toLowerCase().includes("poopy", "butthole")) {
    document.querySelector('.pb-animation').classList.add('mr-pb');
  }
}

const btnAni = () => {
  addBtn.classList.add('flashit');
}


searchInput.addEventListener('keyup', onSearchKeyup); 
addBtn.addEventListener('click', onAddImg);
viewFavsBtn.addEventListener('click', onViewFavs);
showBtn.addEventListener('click', onShow);
newTitle.addEventListener('keyup', onFormKeyup);
newCaption.addEventListener('keyup', onFormKeyup);
newFile.addEventListener('change', updateAddBtn);
photoSection.addEventListener('click', onAreaClick);
photoSection.addEventListener('keypress', onKeypress);
photoSection.addEventListener('focusout', onFocusout);
photoSection.addEventListener('change', onChangeFile);


appendAllPhotos(photos);
