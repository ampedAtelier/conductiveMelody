/**
 * Capacitve Melody Dress Sketch for Make Fashion 2019
 * 
 * Components:
 * * StitchKit's MakeFashion Board Mk.1 01/17/2018 (ATmega32U4)
 * * Adafruit MPR121 12 Key Capacitive Touch Sensor Breakout (prod id: 1982)
 * * 2 strands of NeoPixels
 * 
 * Board Setting: Arduino AVR Boards : Arduino Leonardo 
 */

#include <Wire.h>
#include "Adafruit_MPR121.h"
#include <Adafruit_NeoPixel.h>

// Cap Touch

// Bit Value
#ifndef _BV
#define _BV(bit) (1 << (bit)) 
#endif

Adafruit_MPR121 cap = Adafruit_MPR121();

// Keeps track of the last pins touched
uint16_t lasttouched = 0;
// so we know when buttons are 'released'
uint16_t currtouched = 0;

// The number of cap touch pads
const int NUM_OF_PADS = 8;

// Communication to the Raspberry Pi
//  Each bit in flagByte corresponds to the status of a button
//  Bit 0 = button 0, etc
uint8_t flagByte = 0;
bool flag[NUM_OF_PADS] = {0, 0, 0, 0, 0, 0, 0, 0};

// NeoPixels
Adafruit_NeoPixel backPixels = Adafruit_NeoPixel(24, 5, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel frontPixels = Adafruit_NeoPixel(24, 6, NEO_GRB + NEO_KHZ800);

// Here is where you can put in your favorite colors that will appear!
// just add new {nnn, nnn, nnn}, lines. They will be picked out randomly
//                          R   G   B
uint8_t passiveColors[][3] = {{184, 115, 51},  // copper
                         {218, 138, 103}, // pale copper 
                         {203, 109, 81},  // copper red 
                         {60, 40, 0},  // ginger 
                         {200, 200, 20},  // yellow
                        };
uint8_t activeColors[][3] = {{255, 0, 144},   // magenta 
                         {255, 0, 255},   // fuchsia 
                         {227, 11, 92},   // raspberry 
                         {30, 200, 200},  // blue
                         {54, 117, 136},   // teal blue
                         {0, 128, 128},   // teal
                         {0, 255, 255},   // cyan
                         {0, 183, 235},   // cyan
                        };
// don't edit the lines below
#define PCOLORS sizeof(passiveColors) / 3
#define ACOLORS sizeof(activeColors) / 3

//Timers
unsigned long onTimerLastStart = 0; //milliseconds 
unsigned long offTimerLastStart = 0; //milliseconds 

// Helper
uint8_t buildPacket(bool* flag) {
  uint8_t packet = 0;
  // Check to make sure we won't hang the program
  if(NUM_OF_PADS > 8) {
    // Need to redefine the communication protocol (change the buildPacket function) to get this to work.
    Serial.println("Need to redefine the communication protocol to get this to work.");
    Serial.println("Ending now.");
    // Hang
    while(1); 
  }
  // Set each bit of flagByte to 1 or 0 based on the status in the flag array
  for(int i=0;i<NUM_OF_PADS;i++) {
    packet |= (flag[i]<<i);
  }
  return packet;
}

// pass by reference
void randomOn(Adafruit_NeoPixel &strip, uint8_t colors[][3], int howManyColors) {
  //Serial.println("...randomOn(...)...");
  // get a random pixel from the list
  int pixel = random(strip.numPixels());
  uint32_t color = strip.getPixelColor(pixel);
  if (color == 0) {
    // pick a random favorite color!
    int c = random(howManyColors);
    int red = colors[c][0];
    int green = colors[c][1];
    int blue = colors[c][2];
    strip.setPixelColor(pixel, strip.Color(red, green, blue));
  }
}

// pass by reference
void randomOff(Adafruit_NeoPixel &strip) {
  //Serial.println("...randomOff(...)...");
  // get a random pixel from the list
  int pixel = random(strip.numPixels());
  uint32_t color = strip.getPixelColor(pixel);
  if (color != 0) {
    strip.setPixelColor(pixel, strip.Color(0, 0, 0));
  }
}

void setup() {
  // set up neopixels
  frontPixels.begin();
  backPixels.begin();
  // max brightness
  frontPixels.setBrightness(255);
  backPixels.setBrightness(255); 
  // Initialize all pixels to 'off'
  frontPixels.show(); 
  backPixels.show();
  
  Serial.begin(9600);
  //Serial.begin(115200);
//  while (!Serial) { // needed to keep leonardo/micro from starting too fast!
//    delay(10);
//  }
  // Default address is 0x5A, if tied to 3.3V its 0x5B
  // If tied to SDA its 0x5C and if SCL then 0x5D
  if (!cap.begin(0x5A)) {
    Serial.println("MPR121 not found, check wiring?");
    uint32_t magenta = frontPixels.Color(255, 0, 255);
    //frontPixels.fill(magenta, 0, 24);
    backPixels.fill(magenta, 0, 24);
    //frontPixels.show();
    backPixels.show();
    while (1);
  }
  //Serial.println("MPR121 found!");
  //cap.setThreshholds(12, 6); //default touch and release counts
}

void loop() {
  // Get the currently touched pads
  currtouched = cap.touched();
  // read touch inputs
  // only do anything if the overall touch status has changed
  for (uint8_t i=0; i<NUM_OF_PADS; i++) {
    // it if *is* touched and *wasnt* touched before, alert!
    if ((currtouched & _BV(i)) && !(lasttouched & _BV(i)) ) {
      //Serial.print(i); Serial.println(" touched");
      flag[i] = 1;
      randomOn(frontPixels, activeColors, ACOLORS);
      randomOn(backPixels, activeColors, ACOLORS);
    }
    // if it *was* touched and now *isnt*, alert!
    if (!(currtouched & _BV(i)) && (lasttouched & _BV(i)) ) {
      //Serial.print(i); Serial.println(" released");
      flag[i] = 0;
      randomOff(frontPixels);
      randomOff(backPixels);
    }
  }
  if (millis() - onTimerLastStart > 750) {
    onTimerLastStart = millis();
    randomOn(frontPixels, passiveColors, PCOLORS);
    randomOn(backPixels, passiveColors, PCOLORS);
  }
  if (millis() - offTimerLastStart > 125) {
    offTimerLastStart = millis();
    randomOff(frontPixels);
    randomOff(backPixels);
  }
  frontPixels.show();
  backPixels.show();
  // reset our state
  lasttouched = currtouched;

  // send the data off
  flagByte = buildPacket(flag);  
  Serial.print("0b");
  Serial.println(flagByte);
  delay(5);
}
