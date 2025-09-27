class Review {
  constructor(userId, rating, comment) {
    this.userId = userId;
    this.rating = rating;
    this.comment = comment;
    this.date = new Date();
  }
}
