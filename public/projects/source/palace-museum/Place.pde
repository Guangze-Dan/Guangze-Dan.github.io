class Place {
  String Content; // Description of the Place 
  String name; 
  PImage image;
  Place(String newCon, String newPhoto) {
    Content = newCon; 
    image = loadImage(newPhoto);
  }

  void drawImage() { //More adaptable interface size
    if (image!=null) {
      image.resize(width, height);  
      image(image, 0, 0);
      textFont(font1, 40);
      textSize(24);
      fill(#F2EED7, 100);
      rect(220, 70, 600, 500);
      fill(#000000);
      text("You are "+this.Content, 225, 80, 550, 600); // Show the museum description
    }
  }
}
