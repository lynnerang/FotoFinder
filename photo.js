class Photo {
  constructor(id, title, caption, file, favorite) {
    this.id = id;
    this.title = title;
    this.caption = caption;
    this.file = file;
    this.favorite = favorite;
  }

  saveToStorage() {
    localStorage.setItem("photos", JSON.stringify(photos));
  }

  updatePhoto(card) {
    this.title = card.querySelector('.title-txt').textContent;
    this.caption = card.querySelector('.caption-txt').textContent;
    this.file = card.querySelector('.photo-img').src;
    this.favorite = card.querySelector('.favorite-btn').classList.contains('favorite-btn-active');
    this.saveToStorage();
  }

  deleteFromStorage(target) {
    var index = photos.indexOf(this);
    photos.splice(index, 1); 
    target.closest('.photo-card').remove();
    updateShowBtn();
    this.saveToStorage();
  }
}