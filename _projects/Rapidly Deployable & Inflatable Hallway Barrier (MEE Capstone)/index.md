---
layout: post
title: Rapidly deployable & inflatable hallway barrier (MEE Capstone)
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
## Individual Contributions
To satisfy the objectives of this complex multidimensional project, our team elected to designate leads for various aspects of design and manufacturing based on each person's strengths. I was delegated as the lead for controls, research / technical writing, and client communication.

# Controls
An imperitive attribute of the barrier is that it must be deployable by a single, untrained end-user as quickly as possible. With only user activation required, I developed a safety-critical system which autonomously controls barrier deployment through a series of states with a behavior model in Arduino IDE. This system directs the flow of compressed air at 2000psi with solenoid valves to various pneumatic components, and receives feedback from inline pressure transducers to determine when to switch states. The order of states is as follows:
1. Air is directed to pneumatic actuators which deploy stabilizers located on the base of the barrier system. Once feedback is received that indicates the stabilizing actuators have reached an overshoot of +10% of its specified "lifting pressure," it is assumed that they have begun pushing against walls of the hallway. The solenoid valve which directs airflow to the stabilizers is closed, and the control loop then switches to the next phase.
2. 
