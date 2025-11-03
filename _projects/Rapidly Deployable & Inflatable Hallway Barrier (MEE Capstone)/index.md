---
layout: post
title: Rapidly Deployable & Inflatable Hallway Barrier
description:  Tasked by Sandia National Laboratories to design a lightweight inflatable barrier to interrupt/disrupt the movement of personnel at strategic chokepoints for indoor applications. Worked alongside five other hardworking engineering undergraduates to research, design, and manufacture a system to deliver to our client over the course of two semesters.
skills: 
- Control systems design
- Finite State Machines / Behavior Models
- Electro-pneumatics
- Literature review
- Mechanical testing of materials
- Project management & planning
- Client communicaation
- Solenoid valves
main-image: /headerComp.webp 
---

# Individual Contributions

To satisfy the objectives of this complex multidimensional project, our team elected to designate leads for various aspects of design and manufacturing based on each person's strengths. I was delegated as the lead for controls, research / technical writing, and client communication.



## Controls

An imperitive attribute of the barrier is that it must be deployable by a single, untrained end-user as quickly as possible. With only user activation required, I developed a safety-critical system which autonomously controls barrier deployment through a series of states with a Finite State Machine in Arduino IDE. This system directs the flow of compressed air at 2000psi with solenoid valves to various pneumatic components, and receives feedback from inline pressure transducers to determine when to switch states.



### Phases of Deployment

1. **Stabilizer deployment.** Air is directed to pneumatic actuators which deploy stabilizers located on the base of the barrier system. Once feedback is received that indicates the stabilizing actuators have reached an overshoot of +10% of its specified "lifting pressure," it is assumed that they have begun pushing against walls of the hallway. The solenoid valve which directs airflow to the stabilizers is closed, and the control loop then switches to the next phase.
2. **Linkage system deployment.** Solenoid valve 2 opens, directing airflow to the linkage system, also actuated by pneumatic cylinders. Similarly, once the pressure transducer measuring the pressure within the cylinder reports an overshoot of +20% of its lifting pressure, it closes solenoid valve 2 and we move to the next phase of deployment.
3. **Airbag deployment.** With each tributary path closed, airflow is directed to a manifold which in turn directs airflow to 10 separate chambers within the airbag. Once the pressure transducer measuring the pressure of the line connected to the highest airbag reports an internal pressure of 5 psi the system moves to the final state of deployment.
4. **Maintenance.** The control system monitors feedback from each pressure transducer. If any cylinder has its internal pressure reduced below its lifting pressure, the solenoid valve which directs flow to that cylinder is reopened until initial deployment conditions are met again.

The current state being executed and debug / operational data are output to a 16x2 LCD. Emergency stop handling is included as a safety precaution, and a reset function was added primarily for quick prototyping. Basic error handling is present to handle negative pressure readings, unexpected states, and timeouts.



### Finite State Model

```cpp
switch (state) {
  case 1: // Solenoid CLOSED until P1 >= 100 psi
    digitalWrite(relay_3, LOW);
    if (pressure_1 >= targetPressure1) {
      Serial.println("Case 1 complete: P1 >= 100 psi");
      state = 2;
      stateStartTime = currentMillis;
    }
    break;

  case 2: // Solenoid OPEN until P2 >= 100 psi
    digitalWrite(relay_3, HIGH);
    if (pressure_2 >= targetPressure2) {
      Serial.println("Case 2 complete: P2 >= 100 psi");
      state = 3;
      stateStartTime = currentMillis;
    }
    break;

  case 3: // Solenoid OPEN indefinitely
    digitalWrite(relay_3, HIGH);
    break;

  default:
    Serial.println("Unknown state. Resetting.");
    resetSystem();
    break;
}
```



### Emergency Stop Monitoring
The emergency stop runs independetly every loop iteration prior to the FSM to ensure the highest priority. It additionally contains a stable-hold condition which allows the system to reboot easily back to setup().

```cpp
if (digitalRead(emergency_stop) == LOW) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("EMERGENCY STOP");
  Serial.println("EMERGENCY STOP");
  digitalWrite(relay_3, LOW); // Close solenoid

  unsigned long holdStart = millis(); // stable hold conditional restart
  while (millis() - holdStart < 10000) {
    if (digitalRead(emergency_stop) == HIGH) {
      holdStart = millis();
    }
    if (millis() - holdStart >= 1000) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("RESETTING...");
      delay(1000);
      resetSystem();
      break;
    }
  }
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("STOP TIMEOUT");
  delay(2000);
}
```



### Reset Function

```cpp
void resetSystem() {
  static bool hasReset = false;
  if (!hasReset) {
    hasReset = true;
    void(*resetFunc)(void) = 0;
    resetFunc();
  } else {
    Serial.println("Reset already performed. Aborting additional reset.");
  }
}
```



