//Images:
//b.jpg - Credits: http://xn--vcsu3i05le6a3dq38n.com/digital/1353.htm
//Hall of Imperial Supremacy.png - Credits: https://pano.dpm.org.cn/gugong_pano/index.html
//Hall of Literary Brilliance.png - Credits: https://pano.dpm.org.cn/gugong_pano/index.html
//Hall of Mental Cultivation.png - Credits: https://pano.dpm.org.cn/gugong_pano/index.html
//Palace of Compassion and Tranquility.png - Credits: https://pano.dpm.org.cn/gugong_pano/index.html
//Palace of Heavenly Purity.png - Credits: https://pano.dpm.org.cn/gugong_pano/index.html
//Palace of Prolonging Happiness.png - Credits: https://pano.dpm.org.cn/gugong_pano/index.html
//The Palace Museum.jpg - Credits: http://616pic.com/image/gugong.html
//5.png - Credits: https://ms.pngtree.com/freepng/cartoon-palace-gate-free-button_5456181.html
//0.png - Credits: https://www.51yuansu.com/search/katonggugong.html
//2.png - Credits: https://ixintu.com/sucai/7xQVjPUWk.html
//7.png - Credits: bing.clbug.com
//1.png - Credits: http://616pic.com/tupian/zhongguogongdian.html
//3.png - Credits: https://669pic.com/tupian/zhongguogugong.html
//6.png - Credits: https://599ku.com/sc/11115403.html
//4.png - Credits: https://669pic.com/tupian/zhongguogugong.html
//Gif:
//Palace.gif -Credits: https://699pic.com/tupian/gif-gugong.html
//BGM:
//BGM.mp3 - Credits: http://www.htqyy.com/gedan/play/953
int placeNumber = 0;
PFont font1;
PFont font2;
PFont font3;
int scene;
PImage BGimg;
int i=0;
boolean showMenu = false;
PImage[] icons; 
import processing.sound.*;
import gifAnimation.*;//import libraries
Gif Palace;//Gif animation

Place[] places = new Place[8]; //define the places' number as 8
Place currentplace; // Much more convenience global variable
SoundFile BGM;//background music
int placeState=0; // From place 0 to start

void setup() {
  scene = 1;
  Palace = new Gif(this, "Palace.gif");
  Palace.loop();//add a gif at the left corner of my work
  icons = new PImage[8];
  size(800, 600);
  BGM=new SoundFile(this, "BGM.mp3");//sound file
  BGM.loop();//keep playing the BGM
  font1 = loadFont("AmericanTypewriter-Bold-48.vlw");
  font2 = loadFont("Algerian-48.vlw");
  font3 = loadFont("Arial-Black-48.vlw");//Setting the font
  String s0 = "at The gate of Palace musuem.                           The Palace Museum is open Tuesday through Sunday all year round and on national holidays that fell on Mondays, except for the eve of the Spring Festival. There may be temporary closures which cannot always be scheduled in advance since they are frequently caused by unforeseen circumstances. The management of the Museum would like to apologize for any inconvenience caused.";
  String s = "at The Hall of Supreme Harmony (Taihe Dian) The Hall of Supreme Harmony (Taihe Dian) is the most dignified building in the Forbidden City and is commonly referred to as the Hall of Golden Chimes (Jinluan dian). Built in the early fifteenth century (the Yongle reign), it was burned to the ground within months of its dedication. The Jiajing Emperor (r. 1522-1566) renamed it the Hall of Imperial Supremacy(Huangji dian), and upon making Beijing their capital, the Qing rulers quickly changed it to the present name. Its name reflects the significant sociopolitical ideal of universal harmony under the heaven. The current building was reconstructed during the Kangxi era (1662-1722).";
  String s1 = "at The Hall of Imperial Supremacy (Huangji Dian) is the main hall in the area of the Palace of Tranquil Longevity (Ningshou gong), which the Qianlong Emperor (r.1736-1795)built for spending his years after his retirement. Now it was converted into the Treasure Gallery, exhibiting palace paraphernalia and the accessories of emperors and empresses. In the east corridor rooms to the south of the Gate of Concentrated Luck (Ningqimen), the Gallery of Stone Drums, the oldest surviving drum-shaped inscribed stones dating to the Qin dynasty, is installed.";
  String s2 = "at The Hall of Literary Brilliance(Wenhua dian)The Hall of Literary Brilliance (Wenhua Dian) is the main building in an architectural compound that lies to the far east of the Hall of Supreme Harmony (Taihe Dian). It was the residence of the heir apparent during the early period of the Ming dynasty (1368-1644), with green glazed tiles covering the roof. ";
  String s3 = "at The Palace of Prolonging Happiness(Yanxi gong) The Hall of Prolonging Happiness (Yanxi gong) was destroyed by fire during the Daoguang reign (1821-1850). In 1931, a few years after the Palace Museum was founded, three two-storied warehouses were built for storing artifacts. In 2005, the museum installed the Research Center for Traditional Calligraphy and Paintings in the east warehouse, the Research Center for Ceramics in the west warehouse, and a Ceramics Laboratory in the central warehouse.";
  String s4 = "at The Palace of Compassion and Tranquility (Cining gong)The Palace of Compassion and Tranquillity (Cining gong), first built in 1536 in the west of the Forbidden City, was the palatial residence especially built for Empress Dowager Jiang at the order of the Jiajing Emperor (r.1522-1566). In 1769 (the thirty-fourth year of Qianlong reign, Qing dynasty), the main hall of the Palace of Compassion and Tranquility was rebuilt with multiple eaves, and the rear hall was moved further north, in a layout as seen today. ";
  String s5 = "at The Hall of Mental Cultivation(Yangxin Dian)The Hall of Mental Cultivation (Yangxin Dian) was built in 1537 and rebuilt during the Qing emperor Yongzheng's reign (1723-1735). The I-shaped buildings are divided into two parts the front halls and the rear halls. The chamber was moved to the rear halls after the Yongzheng Emperor. The central rooms and the west rooms of the front halls were changed into the place where the emperor handled the state's routine affairs, reviewed memoranda and received his officials.";
  String s6 = "at The Palace of Heavenly Purity (Qianqing gong)The Palace of Heavenly Purity (Qianqing gong) was built in the early fifteenth century as the emperor's principal residence. Having been rebuilt several times after conflagrations, the current building is datable to 1798, the third year of the Jiaqing reign (1796-1820). From the Yongle Emperor (r. 1403-1424) of the Ming dynasty (1368-1644to the early Qing dynasty (1644-191), the Palace of Heavenly Purity was the place where emperors slept and worked. Their coffins were held in this palace before burial fSr several days of ritual procedures and demonstrating a man's peaceful death in his own place.";
//Set up the string to import different text in different pages
  places[0] = new Place(s0, "The Palace Museum.jpg"); // 0
  places[1] = new Place(s, "Hall of Supreme Harmony.png"); // 1
  places[2] = new Place(s1, "Hall of Imperial Supremacy.png"); // 2
  places[3] = new Place(s2, "Hall of Literary Brilliance.png"); //3
  places[4] = new Place(s3, "Palace of Prolonging Happiness.png"); //4
  places[5] = new Place(s4, "Palace of Compassion and Tranquility.png"); //5
  places[6] = new Place(s5, "Hall of Mental Cultivation.png"); //6
  places[7] = new Place(s6, "Palace of Heavenly Purity.png"); //7
  // Define places and directions for the museum
  // Format is place description, background image
  for(int i = 0;i<8;i++){
    icons[i] = loadImage(i+".png");
  }
 
}

void draw() {
  if(mouseY>height/2){
  showMenu = true;
  }else{
  showMenu = false;
  }

  if (scene==1) {
    frameRate(10);
    PImage b;
    b = loadImage("b.jpg");
    image(b, i, 0);
    i=i-10;
    if (i <= -1800) 
    {
      i = 0;
    }
    
    image(b, 1800+i, 0);//Set up a loop to make the image move like an animation
    textAlign(CENTER);
    textSize(25);//Set up the text
    fill(#FFC143);//color
    text("Press 's' To Start", 400, 120);//Set up the start text
    fill(#F5F5F5);//color
    text("The Palace was the imperial palace of the Ming and Qing dynasties (1368-1911 AD), and according to ancient Chinese astrology, the Purple Palace (the North Star) was located in the middle of the sky, where the emperor lived, and where heavenly beings corresponded, hence the name Forbidden City. After the third Ming emperor, Zhu Di, seized the throne and decided to move the capital to Beijing, the construction of the palace began in 1406 AD and was completed by the 18th year of Ming Yongle (1420 AD).                                                                                                                  It is also one of the three largest palaces in the world...", 180, 150, 600, 500);
  } 

  if (scene==2) {
    background(0);
    drawplace();
      if(showMenu){
     noStroke();
  fill(255,200);
  rect(0,300,800,400);
  fill(158,10,10);
  imageMode(CENTER);
  image(icons[0],389,559,100,100);
  image(icons[1],401,466,100,100);
  image(icons[2],400,371,100,100);
  image(icons[3],78,395,100,100);
  image(icons[4],76,491,100,100);
  image(icons[5],615,403,100,100);
  image(icons[6],612,504,100,100);
  image(icons[7],697,458,100,100);
  imageMode(CORNER);
  textSize(20);
  fill(0);
  text("Gate",423,582);
  text("Taihe Dian",414,469);
  text("Huangji Dian",680,437);
  text("Wenhua dian",633,519);
  text("Yanxi gong",611,379);
  text("Cining gong",86,482);
  text("Yangxin Dian",84,385);
  text("Qianqing gong",415,371);
  }
  }
  textFont(font2, 40);
  fill(#F0DF24);
  text("THE PALACE MUSEUM", 400, 50);
  image(Palace, 30, 80, 150, 150);
}
// if key pressed choose an direction
void keyPressed() {
     if (key=='S'||key=='s') {
        scene=2;
      }
      //change place with key
        if(keyCode==RIGHT){
    placeNumber++;
    if(placeNumber>7){
     placeNumber=7;
    }
  }else if(keyCode==LEFT){
    placeNumber--;
    if(placeNumber<0){
     placeNumber=0;
    }
  }
   
} 

//show place
void drawplace() {
places[placeNumber].drawImage();     
}

//click map to choose place
void mouseClicked(){
  if(showMenu){
   if(dist(mouseX,mouseY,389,559)<50){
   placeNumber = 0;
  }
  if(dist(mouseX,mouseY,401,466)<50){
   placeNumber = 1;
  }  if(dist(mouseX,mouseY,400,371)<50){
   placeNumber = 7;
  }  if(dist(mouseX,mouseY,78,395)<50){
   placeNumber = 6;
  }  if(dist(mouseX,mouseY,76,491)<50){
   placeNumber = 5;
  }  if(dist(mouseX,mouseY,615,403)<50){
   placeNumber = 4;
  }  if(dist(mouseX,mouseY,612,504)<50){
   placeNumber = 3;
  }  if(dist(mouseX,mouseY,697,458)<50){
   placeNumber = 2;
  }
  println(placeNumber);
  } 

}
