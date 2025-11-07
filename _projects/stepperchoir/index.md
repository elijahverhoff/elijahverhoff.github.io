---
layout: post
title: Arduino Controlled Stepper Motor Choir
description:  Developed a program in Arduino IDE which modularly controls stepper motors to create polyphonic music. Created an accompanying Python script which withdraws note data (frequency, duration, accidentals, etc.) from music XML files and organizes them into an Excel spreadsheet.
skills: 
- Python
- Arduino
- Microcontrollers
- Circuit Design
- PLC Programming
- Stepper Motors
main-image: /headerComp.webp
---


## Goals

The purpose of this project was to gain a deeper understanding of PLC programming. Many guides are available online which outline how to interface stepper motors with an Arduino for this purpose, using MIDI as an input to easily track all note data. To craft my own previously undocumented solution, I decided to use raw note data as the program's input.



### Highlights
 - Hardware: motor drivers, power, and wiring considerations
 - Firmware: non-blocking step scheduling, tempo tracking
 - Parser: MusicXML - interleaved note/duration/tempo CSVs



## Arduino Hardware & Circuit

Four A4988 motor driver chips were used with an Arduino CNC Shield to interface with the stepper motors. A 12VDC power source is used to power the motors, while the motor drivers are powered via the Arduino Mega's on-board 5VDC pin. A preliminary circuit diagram (excluding the CNC Shield) is shown below.

### Interactive Circuit Diagram

<div style="position: relative; width: 100%; padding-top: calc(max(56.25%, 400px));">
  <iframe src="https://app.cirkitdesigner.com/project/63fb81e0-d7ee-4076-a3c7-8c742165dabe?view=interactive_preview"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen>
  </iframe>
</div>
<p style="margin-top: 5px;">
  Edit this project interactively in
  <a href="https://app.cirkitdesigner.com/project/63fb81e0-d7ee-4076-a3c7-8c742165dabe" target="_blank" rel="noopener">Cirkit Designer</a>.
</p>



## Arduino Code

The Arduino sketch controls four stepper motors to create a synchronized “choir.” Each motor plays a melody using note frequency (step rate) and note duration (how long it plays before moving to the next note).

The notes are pre-loaded into flash memory (PROGMEM) as arrays generated from the MusicXML parser Python script. These arrays are stored in flash memory to conserve RAM, as the note data for multiple motors is quite large.
The program runs all motors concurrently by comparing elapsed microseconds (micros()) for pitch timing and milliseconds (millis()) for note timing.

### Control Loop

Each cycle:
1. Enables or disables the motor drivers.
2. Checks if each motor's note duration has expired (handleNoteChange).
3. Emits step pulses at the correct frequency (singleStep).
4. If no steps are issued within the timeout period, the enable pin is set HIGH to disable all drivers.

```cpp

void loop() {
  digitalWrite(enPin, disableSteppers);

  handleNoteChange(1, stepPin_M1, i);
  singleStep(1, stepPin_M1);

  handleNoteChange(2, stepPin_M2, j);
  singleStep(2, stepPin_M2);

  handleNoteChange(3, stepPin_M3, k);
  singleStep(3, stepPin_M3);

  handleNoteChange(4, stepPin_M4, u);
  singleStep(4, stepPin_M4);

  if (millis() - WDT >= TIMEOUT) {
    disableSteppers = HIGH;
  }
}
```

### Step Pulse Generation

This function handles the pitch timing. With a resolution of microseconds, this function ensures that the motor plays a pitch by delivering step pulses to the motor at the frequency of the note to be played. For example, to produce A4 (~440 Hz), the period would be approximately 1,000,000 µs / 440 ≈ 2273 µs.

motorSpeeds[motorNum] defines the time between steps in microseconds (the inverse of frequency). A smaller value results in a higher pitch.

```cpp

void singleStep(byte motorNum, byte stepPin) {
  if ((micros() - prevStepMicros[motorNum] >= motorSpeeds[motorNum]) && (motorSpeeds[motorNum] != 0)) {
    prevStepMicros[motorNum] += motorSpeeds[motorNum];
    WDT = millis();
    digitalWrite(stepPin, HIGH);
    digitalWrite(stepPin, LOW);
  }
}
```

### Note Changes

This function determines when the motor should switch to the next note. When the note’s duration expires, it increments the motor’s index by 4 to fetch the next note's pitch and duration from the interleaved arrays in PROGMEM. Because the arrays are interleaved (one entry per motor per chord), adding 4 advances that motor to its next note. This allows all four motors to advance independently through their melodies or harmonies, even if their note durations differ.

```cpp

void handleNoteChange(byte motorNum, byte stepPin, int& motorVar) {
  if (millis() - prevStepMillis[motorNum] >= motorDurations[motorNum] && (motorDurations[motorNum] != 0)) {
    prevStepMillis[motorNum] += motorDurations[motorNum];

    motorVar += 4;

    // Check array bounds using the size of PROGMEM array
    uint16_t arrayLen = sizeof(motorNotes) / sizeof(motorNotes[0]);
    if (motorVar >= arrayLen) motorVar = 0;

    motorSpeeds[motorNum] = pgm_read_word_near(motorNotes + motorVar);
    motorDurations[motorNum] = pgm_read_word_near(motorNoteDurations + motorVar);
  }
}
```
