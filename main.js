let photos = JSON.parse(localStorage.getItem("photos")) || [];
let totalFavs = photos.filter(photo => photo.favorite).length;
let displayedCards = [];
let viewingFavs = false;
let cardsHidden = false;
let inputId = 1;
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const newTitle = document.getElementById('j-new-title');
const newCaption = document.getElementById('j-new-caption');
const newFile = document.querySelector('.new-file-input')
const addBtn = document.querySelector('.add-btn');
const viewFavsBtn = document.querySelector('.view-favs-btn');
const showBtn = document.querySelector('.show-btn');
const photoSection = document.querySelector('.photo-section');

searchInput.addEventListener('keyup', onSearchKeyup); 
addBtn.addEventListener('click', onAddImg);
viewFavsBtn.addEventListener('click', onViewFavs);
showBtn.addEventListener('click', onShow);
photoSection.addEventListener('click', onAreaClick);
photoSection.addEventListener('keypress', onKeypress);
photoSection.addEventListener('focusout', onFocusout);
photoSection.addEventListener('change', onChangeFile);
newTitle.addEventListener('keyup', onKeyup);
newCaption.addEventListener('keyup', onKeyup);
newFile.addEventListener('change', updateAddBtn)

appendAllPhotos(photos);


function onAddImg() {
  const reader = new FileReader();
  if (newFile.files[0] && validType(newFile.files[0])) {
    reader.readAsDataURL(newFile.files[0]); 
    reader.onload = addPhoto;
  } 
}

function onChangeFile(e) {
  if (e.target.classList.contains('change-file-input') && e.target.files[0] && validType(e.target.files[0])) {
    const input = e.target;
    const card = e.target.closest('.photo-card');
    const reader = new FileReader();
    reader.readAsDataURL(input.files[0]);
    reader.onload = function() {
      card.querySelector('.photo-img').src = reader.result;
      findObjByDom(card).updatePhoto(card);
    }
  }
}

function onKeyup() {
  const totalChars = event.target.value.length;
  const charLimit = parseInt(event.target.nextElementSibling.querySelector('.char-limit').innerText);
  const charCounter = event.target.nextElementSibling.querySelector('.char-count');
  charCounter.innerText = totalChars;
  showErrs(event.target, charLimit);
  updateAddBtn();
}

function onSearchKeyup() {
  photoSection.innerHTML = "";
  const searchTerm = searchInput.value.toLowerCase();
  let searchResults = photos.filter(photo => photo.title.toLowerCase().includes(searchTerm) || photo.caption.toLowerCase().includes(searchTerm));
  if (viewingFavs === true) {
    searchResults = photos.filter(photo => photo.favorite === true && (photo.title.toLowerCase().includes(searchTerm) || photo.caption.toLowerCase().includes(searchTerm)));
  }
  searchResults.forEach(photo => displayCard(photo));
  displayedCards = Array.from(document.querySelectorAll('.photo-card'));
  hideCards();
  updateShowBtn();
}

function onViewFavs() {
  clearPhotosAndSearch();
  if (!viewingFavs) {
    const displayedPhotos = photos.filter(photo => photo.favorite);
    displayedPhotos.forEach(photo => displayCard(photo));
    viewingFavs = true;
    displayedCards = Array.from(document.querySelectorAll('.photo-card'));
    hideCards();
    updateShowBtn();
  } else {
    appendAllPhotos(photos);
    viewingFavs = false;
  }
  updateViewBtn();
}

function onAreaClick(e){
  const card = e.target.closest('.photo-card');
  if (card !== null) {
    findAction(findObjByDom(card), e.target);
  }
}

function onKeypress(e) {
  const key = e.which || e.keyCode;
  console.log(e.target.closest('.photo-card'));
  if (!validLength(e.target.closest('.photo-card').querySelector('.title-txt').textContent, 30) || !validLength(e.target.closest('.photo-card').querySelector('.caption-txt').textContent, 90)) {
    e.preventDefault();
  } else if (key === 13 && e.target.classList.contains('card-txt')) {
    e.preventDefault();
    const card = e.target.closest('.photo-card');
    findObjByDom(card).updatePhoto(card);
  }
}

function onFocusout(e) {
  if (e.target.classList.contains('card-txt')) {
    const card = e.target.closest('.photo-card');
    findObjByDom(card).updatePhoto(card);
  }
}

function onShow() {
  currentCardList = Array.from(document.querySelectorAll('.photo-card'));
  btnAni();
  if (cardsHidden === false) {
    hideCards();
  } else {
    showCards();
  }
}

function addPhoto(e) {
  const file = e.target.result;
  const newPhoto = new Photo(Date.now(), newTitle.value, newCaption.value, file, false);
  checkForMrPB(newTitle.value, newCaption.value);
  photos.unshift(newPhoto);
  newPhoto.saveToStorage();
  resetForm();
  appendAllPhotos(photos);
  btnAni();
}

function appendAllPhotos(strArray) {
  if (strArray === []) {
    photoSection.innerHTML = "Start adding photos using the form above!";
  } else {
    clearPhotosAndSearch();
    viewingFavs = false;
    updateViewBtn();
    photos = strArray.map(photo => new Photo(photo.id, photo.title, photo.caption, photo.file, photo.favorite));
    photos.forEach(photo => displayCard(photo));
    displayedCards = Array.from(document.querySelectorAll('.photo-card'));
    hideCards();
    updateShowBtn();
  }
}
 
function findAction(photoObj, target) {
  if (target.classList.contains('delete-btn')) {
    photoObj.deleteFromStorage(target);
    updateShowBtn();
  } else if (target.classList.contains('favorite-btn')) {
    toggleFavorite(photoObj, target);
  } 
}

function toggleFavorite(obj, target) {
  if (!obj.favorite) {
    target.classList.add('favorite-btn-active');
    totalFavs++;
  } else {
    target.classList.remove('favorite-btn-active');
    totalFavs--;
  }
  obj.updatePhoto(target.closest('.photo-card'));
  updateViewBtn();
}

function displayCard(photo) {
  const html = `<article class="photo-card fade-in" data-id="${photo.id}">
          <div class="card-main">
            <div class="card-title"><h2 class="card-txt title-txt" id="photo-title" contenteditable="true" aria-live="polite" aria-label="Add text or type / to add or edit photo title" role="textbox">${photo.title}</h2></div>
            <div class="card-photo">
              <label class="change-file-label" for="change-file${inputId}"><img class="photo-img" src="${photo.file}"/>
              </label>
              <input type="file" id="change-file${inputId}" class="change-file-input" accept="image/*">
            </div>
            <div class="card-caption"><p class="card-txt caption-txt" id="photo-caption" contenteditable="true" aria-live="polite" aria-label="Add text or type / to add or edit photo caption">${photo.caption}</p></div>
            </div>
            <div class="card-footer">
              <div class="btn-image delete-btn" aria-role="button" aria-label="Delete this photo" aria-controls="${photo.id}">
              </div>
              <div class="animated flashit btn-image favorite-btn" aria-role="button" aria-label="Add photo to favorites" aria-controls="${photo.id}">
            </div>
          </div>
        </article>`;
  photoSection.innerHTML += html;
  inputId++;
  showFavStatus(photo);
}

function findObjByDom(card) {return photos.find(photo => photo.id === parseInt(card.dataset.id));} 

function findDomByObj(objId) {return document.querySelector(`[data-id="` + objId + `"]`);}

function validLength(input, limit) {return input.length > 0 && input.length <= limit;}

function validType(file) {return (/\.(jpe?g|png|gif)$/i.test(file.name));}

function showFavStatus(obj) {
  if (obj.favorite) {
    const favIcon = findDomByObj(obj.id).querySelector('.favorite-btn');
    favIcon.classList.add('favorite-btn-active');
  }
}

function clearPhotosAndSearch() {
  photoSection.innerHTML = "";
  searchInput.value = "";
}

function hideCards() {
  listOfTen = displayedCards.slice(0, 10);
  photoSection.innerHTML = "";
  listOfTen.forEach(node => photoSection.appendChild(node));
  showBtn.innerText = "Show More...";
  cardsHidden = true;
}

function showCards() {
  clearPhotosAndSearch();
  displayedCards.forEach(node => photoSection.appendChild(node));
  showBtn.innerText = "Show Less...";
  cardsHidden = false;
}

function updateShowBtn() {
  if (displayedCards.length < 10) {
    showBtn.classList.add('hidden');
  } else {
    showBtn.classList.remove('hidden');
  }
}

function updateViewBtn() {
  if (!viewingFavs) {
    viewFavsBtn.innerText = "View " + totalFavs + " Favorites";
  } else {
    viewFavsBtn.innerText = "View All Photos";
  }
}

function updateAddBtn(){
  if (document.querySelector('.new-file-input').files[0] && validLength(newTitle.value, 30) && validLength(newCaption.value, 90)) {
    addBtn.disabled = false;
  } else {
    addBtn.disabled = true;
  }
}

function showErrs(input, limit) {
  if (input.value.length > 0 && input.value.length <= limit) {
    input.nextElementSibling.classList.remove('error');
  } else {
    input.nextElementSibling.classList.add('error');
  }
}

function resetForm() {
  newTitle.value = "";
  newCaption.value = "";
  searchInput.value = "";
  addBtn.disabled = true;
  const counts = Array.from(document.querySelectorAll('.char-count'));
  counts.forEach(count => count.innerText = "0");
}

function checkForMrPB(title, body) {
  if (title.toLowerCase().includes("poopy", "butthole") || 
    body.toLowerCase().includes("poopy", "butthole")) {
    document.querySelector('.pb-animation').classList.add('mr-pb');
  }
}

function btnAni(){
  addBtn.classList.add('heartBeat');
}

