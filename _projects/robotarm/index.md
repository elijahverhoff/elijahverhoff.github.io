---
layout: post

title: 3-DOF Robotic Arm

description: Outlines the design, simulation, and fabrication of a 3-DOF robotic manipulator.

skills: 
- Mobile Robotics
- Robot Design
- SOLIDWORKS
- Robot Simulation
- ROS 2
- MoveIt 2
- URDF / Xacro
- Motion Planning
- FFF 3D Printing

main-image: /headerComp.webp
---



## Goals

The aim of this project is to learn how to interface with robotic control systems. While this could be completed simply by purchasing a commercial 3-DOF product and following the setup instructions, I aim to start from scratch to ensure an in-depth understanding of assembling and controlling robotic systems (and to save money). The simplest possible solution is to model the robot in URDF/Xacro, skip the custom IK solver, and rely on MoveIt’s default numerical IK. This would allow basic joint-space planning in RViz but would not demonstrate a foundational knowledge with motion planning.

### Highlights
- Design: 3D model creation in SOLIDWORKS with accurate motion constrained with assembly mates.
- Simulation: MoveIt 2 integrated with a custom FK/IK solver to ensure accurate motion planning with closed-loop mechanisms.
- Fabrication: FFF 3D printing and assembly.



---



## Design

It was exceptionally tricky to find easy-to-follow literature on design theory surrounding this type of robot. Many 3-DOF robots that serve as open-source learning projects are SCARA robots: which by all accounts are known to be a good “beginner” robot to design. While the original project outline doesn’t explicitly state the robot arm should be a 3R-DOF robot, I decided that a SCARA robot was not my original design intention, and that I would commit myself to designing a 3R-DOF robot arm instead. This decision came with a few unexpected roadblocks:

* A 3-DOF robot arm with 3 revolute joints controlling the yaw of the base, the pitch of the shoulder, and the pitch of the elbow experiences a large amount of torque at the shoulder.
* 3D printing rigid links that deflect a negligible amount is challenging given the project parameters (capable of lifting 1 lb at a distance of 1 ft).
* The elbow of the robot cannot be actuated by a (cheaply available) servo motor also mounted at the elbow, as the weight of the servo would greatly increase the force experienced by the shoulder.
* Any closed-loop design solutions (e.g., a four-bar mechanism) to transmit loading conditions will greatly complicate the motion planning in MoveIt. Furthermore, URDF doesn’t support closed-loop robot descriptions.

The solution: designing a parallelogram 4-bar linkage system to transmit force from a motor mounted on the arm base to the forearm. While this still introduces a closed-loop linkage system to the robot arm, it helped satisfy the goal of delivering a payload at the previously stated parameters. With a parallelogram 4-bar linkage system controlling the pitch of the elbow, our driving arm mounted at the arm base rotates at a 1:1 ratio collinearly with the forearm – this allows a simplified model to be simulated in RViz/MoveIt, and with a custom IK/FK solver, will still be able to simulate accurate motion planning. EEZYBotARM is a 3D printable, open-source, 3DOF robot arm that uses this mechanism. My design is heavily influenced by this existing model to avoid printing issues and to not “reinvent the wheel.”

<!-- SOLIDWORKS assem -->
{% include image-gallery.html images="CADAssem_Iso.png" %} <br>

<!-- SOLIDWORKS model base -->
{% include image-gallery.html images="CADAssem_base.png" %} <br>

<!-- SOLIDWORKS model end effector -->
{% include image-gallery.html images="CADAssem_ee.png" %} <br>

<!-- SOLIDWORKS motion video -->
<div style="display: flex; justify-content: center; margin: 2rem 0;">
  <video 
    src="./sw_sim.mp4"
    controls
    style="max-width: 800px; width: 100%; border-radius: 8px; box-shadow: 0 0 12px rgba(0,0,0,0.3);"
  >
    Your browser does not support the video tag.
  </video>
</div>

## Simulation

SOLIDWORKS was used to calculate origin-to-origin distances in X, Y, and Z for each link to set-up the robot description in URDF. A simple robot description, omitting closed-loops, was generated with the fixed base, the rotating base, the upper arm, the forearm, and the end effector subassembly.The URDF robot description can be found [here.](https://drive.google.com/file/d/17NUcIzNML3wLjn3Vf0oRQ9cXDPPyMkwc/view?usp=drive_link)

The custom IK/FK solver is necessary to motion plan accurately with MoveIt because the elbow is actuated by a parallelogram 4-bar linkage mechanism – All other linkages can be set as motion constraints on the joints in MoveIt. These equations have been neatly compiled into a LaTeX document found [here.](https://drive.google.com/file/d/1LzR1SnR1SEesYTvwaYrWoqJifeOqBn_p/view?usp=drive_link)

<!-- MoveIt model -->
{% include image-gallery.html images="moveit_model.png" %} <br>

<!-- MoveIt motion planning demo -->
<div style="display: flex; justify-content: center; margin: 2rem 0;">
  <video 
    src="./moveit_motionplanning.mp4"
    controls
    style="max-width: 800px; width: 100%; border-radius: 8px; box-shadow: 0 0 12px rgba(0,0,0,0.3);"
  >
    Your browser does not support the video tag.
  </video>
</div>

### Fabrication and Assembly

Still under construction!