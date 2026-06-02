---
layout: post
title: Robotic Percussion Driven by a Neural Network
description: "Trained a causal temporal convolutional network for real-time beat tracking (0.855 test F-measure) and drove an Arduino-controlled servo to strike in time with music, synchronizing to within ~15 ms; below the human "just-noticeable-difference" for rhythmic error."
skills:
- PyTorch
- Deep Learning
- Temporal Convolutional Networks
- Real-Time Inference
- Digital Signal Processing
- Audio / Music Information Retrieval
- Python
- Arduino
- Servo Control
- Serial Communication
main-image: /headerComp.webp
---



<!-- Project overview — 3-minute explainer video. Hosted on Google Drive. -->
<div style="margin: 2rem 0;">
  <iframe
    src="https://drive.google.com/file/d/1qecCG8x6ITU950NMUBe_pkGRXNBVxNBn/preview"
    style="width: 100%; aspect-ratio: 16 / 9; border: none; border-radius: 8px; box-shadow: 0 0 12px rgba(0,0,0,0.3);"
    allow="autoplay"
    allowfullscreen>
  </iframe>
</div>



## Goals

This project asks whether a neural network can listen to music and keep time with it well enough to drive a physical actuator live. The core deliverable is a causal temporal convolutional network (TCN) that reads a log-mel spectrogram and outputs a per-frame "beat or not" activation, coupled with an Arduino-driven servo that strikes a target on each predicted beat.

The defining constraint is **causality**. A model intended to drive hardware from a live audio stream can only use past and present audio — it cannot peek ahead. This rules out the bidirectional architectures that dominate offline beat-tracking benchmarks and forces every design decision toward real-time operation. A secondary goal was to quantify exactly what that real-time constraint costs in accuracy.

### Highlights

- **Model:** A causal TCN (284k parameters) with a 2D frequency-reduction frontend and a dilated convolution stack, reaching a 0.855 test F-measure across two datasets.
- **Analysis:** Two controlled ablations (receptive field and the causal constraint) isolating what actually drives performance, plus a per-genre breakdown and an activation-timing study.
- **Robotics:** A real-time inference and scheduling pipeline that compensates for measured audio and servo latency to land servo strikes on the beat.



---



## The Model

The network operates on log-mel spectrograms computed at 100 frames per second (22,050 Hz audio, 81 mel bins). A 2D convolutional frontend (three Conv2d → BatchNorm → ReLU → MaxPool blocks) progressively collapses the frequency axis from 81 bins down to 3 while expanding channel depth, after which the representation is flattened into a 1D time series. That series passes through six residual TCN blocks with dilations of 1, 2, 4, 8, 16, and 32 and a kernel size of 5, and a final 1×1 convolution emits a single logit per frame.

Causality is enforced by **left-only padding** of length `(kernel_size − 1) × dilation` in each block, so a given output frame can only ever depend on frames at or before it. The same code path supports a non-causal variant by switching to symmetric padding, which made the causal-vs-non-causal ablation a clean, controlled comparison.

Training targets were built by placing Gaussian bumps (σ ≈ 2 frames, roughly ±20 ms) at each annotated beat — a soft target that gives partial credit for near-misses, standard practice in beat tracking. To counter the roughly 25:1 imbalance between non-beat and beat frames, the model was trained with a positive-class-weighted BCE loss, using Adam and a plateau-based learning-rate scheduler. At inference, the per-frame sigmoid activations are converted to discrete beat times by peak-picking, with the detection threshold (0.40) and minimum inter-beat interval (150 ms) tuned on the validation set.

### Training

The model was trained for 30 epochs on a single NVIDIA T4 GPU on a combined set of 1,696 tracks from the Ballroom and GTZAN-Rhythm datasets, split 80/10/10 by song. Validation F-measure peaked at 0.852.

{% include image-gallery.html images="trainingCurves.png" %} <br>



---



## Results

On the held-out test set, the causal model reached an overall **F-measure of 0.855** (Ballroom 0.908, GTZAN 0.825). The full `mir_eval` suite is summarized below.

| Slice | F | Cemgil | CMLt | AMLt |
|---|---|---|---|---|
| All (n=152) | 0.855 | 0.801 | 0.718 | 0.761 |
| Ballroom (n=56) | 0.908 | 0.862 | 0.801 | 0.835 |
| GTZAN (n=96) | 0.825 | 0.765 | 0.669 | 0.718 |

In the typical success case, the model's activation shows high contrast between beat and non-beat frames, with predicted beats landing cleanly on the annotations across the whole excerpt.

{% include image-gallery.html images="bestCase.png" %} <br>

### What actually drives performance

Three analyses, taken together, point to a single conclusion: **the music matters more than the model.**

First, **receptive field was not the bottleneck.** A second model (v2, 367k parameters) that roughly quadrupled the past context window matched v1's peak F-measure to within 0.001 — an informative null result. Beat prediction is dominated by local context of two to three bars, which is good news for real-time use, since a shorter receptive field means a smaller audio buffer at inference.

Second, **the cost of causality is modest.** A non-causal variant, identical except for symmetric padding, improved F by only 1.8 points (0.855 → 0.873) — well under the 3–6 point gaps usually reported between bidirectional and unidirectional beat trackers. Most of that gain showed up in the long-range consistency metrics (CMLt, AMLt) rather than per-beat timing, meaning future context mainly helps maintain a steady metrical lock across a full track rather than placing individual beats. For a real-time application, that is an acceptable price.

Third, and most significant, **musical content dwarfs both.** Across GTZAN genres, F-measure ranged from 0.96 (reggae) down to 0.59 (classical) — a spread an order of magnitude larger than any gap between the models I trained. Genres with steady percussive content scored above 0.92; genres with expressive timing or sparse percussion scored far lower. The practical takeaway is that beat-tracking performance is bounded primarily by whether the input contains prominent periodic percussion, not by model capacity.

{% include image-gallery.html images="perGenreF.png" %} <br>

### Timing precision

For the robotics half of the project, the key question is how precisely the model localizes a beat in time. Measuring the offset between activation peaks and annotated beats yielded an approximately Gaussian distribution with a mean of **+0.5 ms** and a standard deviation of **15 ms**. The near-zero bias is the important result: the causal constraint introduces no systematic delay, so the downstream scheduler only has to compensate for mechanical latency, not for the network itself. The 15 ms jitter sets the detection-side floor on achievable synchronization.

{% include image-gallery.html images="latencyHistogram.png" %} <br>

### Failure modes are interpretable

Inspecting the lowest-scoring tracks was as informative as the successes. Several apparent F=0 "failures" turned out to be **annotation errors** — the model produced plausible beats on tracks whose ground-truth files were empty — which prompted an annotation-completeness audit and a documented exclusion of six tracks. Genuine failures were interpretable too: on syncopated material the causal model sometimes locks onto a secondary rhythmic layer (for example, a horn riff) instead of the kick drum, exactly the kind of metrical ambiguity that future context would resolve and a causal model cannot.

{% include image-gallery.html images="worstCase.png" %} <br>



---



## Robotics Integration

With the model characterized, the second half of the project closed the loop to hardware.

### Hardware

The actuator is an SG90 hobby servo driven by an Arduino Mega over PWM on pin 9. The servo strikes a target with a small (~15°) swing, calibrated to produce a clean, audible tap while keeping strike latency low. One practical lesson: **USB power alone was insufficient** — the servo's current draw caused brownouts and unstable strikes, so the Arduino is powered from a wall adapter through its barrel jack. Strike-to-impact latency was measured at **78 ms (±10 ms)** by filming the servo and an on-board LED together in 240 fps slow motion and counting frames between the LED turning on and the servo making contact.

### Software

The runtime is two Python scripts and one Arduino sketch. One script runs the trained model over a song offline and writes out a JSON of predicted beat times (~2 seconds on CPU for a 3-minute song); the other plays the audio and streams single-byte strike commands to the Arduino over serial, timed so each strike lands on the music after accounting for both audio-output and servo latency. The Arduino sketch is a non-blocking state machine (IDLE → STRIKING → RETURNING) that drains the serial buffer every loop and **silently drops any strike command received while the servo is still busy**, preventing command queue buildup at fast tempos.

```cpp
void strike() {
  digitalWrite(LED_PIN, HIGH);
  strikerServo.write(STRIKE_ANGLE);
  delay(STRIKE_HOLD_MS);
  digitalWrite(LED_PIN, LOW);
  strikerServo.write(REST_ANGLE);
  delay(RETURN_MS);
}

void loop() {
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 's') strike();
  }
}
```

### Latency budget

End-to-end timing variability is bounded by the larger of the model's activation jitter (σ ≈ 15 ms) and the servo's mechanical jitter (~10 ms), for a system-level synchronization precision of roughly **15 ms** — comfortably below what most listeners perceive as a rhythmic error. The audio playback stack adds a large but *constant* latency (~270 ms on the development laptop), which is measured once and compensated for in software so the strikes still land on the beat.

### Demo behavior

Demonstration tracks were chosen deliberately to span the model's performance range, including known failure cases:

- **Stayin' Alive** (Bee Gees, ~104 BPM) — clean disco kick; the model locks immediately and strikes audibly land on the beat.
- **Billie Jean** (Michael Jackson, ~117 BPM) — classic backbeat; fully synchronized throughout.
- **Sir Duke** (Stevie Wonder, ~124 BPM) — the predicted failure case: the model locks onto the syncopated horn riff rather than the kick, producing strikes that are rhythmically consistent but on the wrong beat layer.
- **Clair de Lune** (Debussy) — solo piano with no percussion and expressive timing; the model produces sparse, inconsistent strikes, demonstrating the genre-dependence the evaluation predicted.

<!-- 30-second hardware demo — Stayin' Alive synchronized servo strikes.
     Hosted on Google Drive. -->
<div style="margin: 2rem 0;">
  <iframe
    src="https://drive.google.com/file/d/10GNSU-em0evfEN7q8_hzUeWL1ydSq0uN/preview"
    style="width: 100%; aspect-ratio: 16 / 9; border: none; border-radius: 8px; box-shadow: 0 0 12px rgba(0,0,0,0.3);"
    allow="autoplay"
    allowfullscreen>
  </iframe>
</div>



---



## Takeaways

The headline result is that a compact causal network — under 300k parameters — keeps time accurately enough to drive hardware with no perceptible lag, and that the real-time constraint costs less than two F-measure points. The more interesting finding came from the ablations: across the regimes I explored, neither receptive field nor causality moved the needle nearly as much as the rhythmic character of the input itself. That reframes the engineering problem from "build a bigger model" toward "understand which signals the model can and cannot lock onto," which is also what made the robot's failures predictable rather than mysterious.
