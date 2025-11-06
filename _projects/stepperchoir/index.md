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


## Overview

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
