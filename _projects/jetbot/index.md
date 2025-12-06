---
layout: post
title: Jetbot Control with AR Tags and 3D Pose Estimation
description:  Used a Jetbot running ROS 2 on a Jetson Nano to calibrate a CSI camera, detect ARUCO markers, estimate their 3D pose, and drive the robot relative to the tag.
skills: 
- ROS 2
- Jetbot / Jetson Nano
- Dockerized Robotics Development
- GStreamer / gscam
- Camera Calibration
- ARUCO Markers
- 3D Pose Estimation
- Python Robotics
- Mobile Robot Control
- RViz2 Visualization
main-image: /headerComp.webp
---



## Goals

This project employs perception and control logic a Jetbot. It showcases use of Jetbot's onboard CSI camera to detect AR tags, estimate their 3D pose, and then command the robot so it automatically turns and drives toward the marker. The focus was on integrating camera streaming, calibration, pose estimation, and closed-loop control into a single repeatable workflow.

### Highlights

- CSI camera streaming into ROS 2 using a GStreamer-based camera node and a calibrated pinhole model.  
- AR tag detection and 3D pose estimation from the live image stream.  
- Python controller that converts tag pose into differential-drive commands so the Jetbot actively seeks the marker.



---



## System Overview

The robot is an NVIDIA Jetson Nano–based Jetbot with a differential-drive base and a CSI camera mounted on the front. All ROS 2 nodes run inside a Docker container on the Nano, which keeps dependencies isolated and makes the setup easy to reproduce.

The main data flow is:

- The CSI camera is accessed through a GStreamer pipeline and exposed as a standard image topic in ROS 2.  
- A marker detector subscribes to the camera topic and publishes ARUCO detections with full 3D pose information.  
- A custom control node subscribes to these detections and publishes velocity commands to the Jetbot’s motor driver.

A laptop on the same network is used for development and visualization/monitoring with RViz2 and other ROS tools.

### Simplified launch code

```xml
<launch>
  <node pkg="gscam" exec="gscam_node">
    <param name="gscam_config"
      value="nvarguscamerasrc sensor-id=0 !
             video/x-raw(memory:NVMM), width=(int)640, height=(int)360,
             framerate=10/1, format=(string)NV12 !
             nvvidconv ! videoconvert" />
    <param name="camera_info_url"
      value="package://py_pubsub/launch/csi_cam_640x360.ini" />
  </node>

  <node pkg="aruco_opencv" exec="aruco_tracker_autostart">
    <param name="cam_base_topic" value="/camera/image_raw" />
    <param name="marker_size" value="0.05" />
    <param name="marker_dict" value="4X4_50" />
  </node>

  <node pkg="jetbot_ros" exec="motors_waveshare" />
</launch>

```



---



## Perception

The camera is a MIPI-CSI module connected directly to the Jetson Nano. A GStreamer pipeline streams frames from the camera into ROS 2 as raw images. Once this is running, the robot continuously publishes an image topic that can be monitored remotely.

### Starting camera node

```bash
ros2 run gscam gscam_node --ros-args \
  -p gscam_config:="nvarguscamerasrc sensor-id=0 !
      video/x-raw(memory:NVMM),width=(int)640,height=(int)360,
      framerate=10/1,format=(string)NV12 !
      nvvidconv ! videoconvert" \
  -p camera_info_url:=package://gscam/examples/csi_cam_640x360.ini \
  -p frame_id:=v4l_frame

```

To make pose estimation reliable, the camera is calibrated at 640×360 resolution. A calibration file containing the intrinsic matrix, distortion coefficients, and projection parameters is loaded at startup. This allows the system to remove lens distortion and convert pixel measurements into consistent poses.

AR tags from a 4×4 dictionary are printed at a known physical size. The detector node listens to the camera topic, identifies markers in each frame, and publishes a list of detections. Each detection includes the marker ID and its position and orientation relative to the camera frame, giving the controller a full 6-DoF pose to work with.

### Starting ARUCO detection

```bash
ros2 run aruco_opencv aruco_tracker_autostart --ros-args \
  -p cam_base_topic:=/camera/image_raw \
  -p marker_size:=0.05 \
  -p marker_dict:=4X4_50

```



---



## Jetbot Control Behavior

The Jetbot controller is implemented as a small Python node that subscribes to the ARUCO detection topic and publishes velocity commands to the robot.

For each incoming detection, the controller:

- Chooses a marker of interest (for example, the first visible tag).  
- Reads the marker position in the camera frame, focusing on lateral offset (left/right) and forward distance.  
- Computes an angular correction to rotate the robot until the tag is centered in the image.  
- Computes a linear velocity to move forward until the robot reaches a comfortable stand-off distance from the marker.

When a marker is visible, the Jetbot turns to face it and drives toward it in a smooth motion. As the distance shrinks, the commanded velocity is reduced so the robot slows down instead of overshooting. If no detections are available, the controller can fall back to stopping in place or slowly searching by rotating.

### Core control logic

This controller makes the Jetbot orient itself toward the marker and approach smoothly without overshooting.

```python
import rclpy
from geometry_msgs.msg import Twist
from aruco_opencv_msgs.msg import ArucoDetection

class MoveToAruco:
    def __init__(self, node):
        self.node = node
        self.cmd_pub = node.create_publisher(Twist, '/jetbot/cmd_vel', 10)
        node.create_subscription(ArucoDetection,
                                 '/aruco_detections',
                                 self.callback, 10)

    def callback(self, msg):
        if not msg.markers:
            self.cmd_pub.publish(Twist())
            return

        m = msg.markers[0]
        x = m.pose.position.x
        z = m.pose.position.z

        ang = -0.8 * x
        lin =  0.5 * (z - 0.4)

        cmd = Twist()
        cmd.angular.z = max(min(ang, 1.0), -1.0)
        cmd.linear.x  = max(min(lin, 0.6), -0.6)
        self.cmd_pub.publish(cmd)

def main():
    rclpy.init()
    node = rclpy.create_node('move2aruco')
    MoveToAruco(node)
    rclpy.spin(node)

```



---



## Testing and Results

With the full launch configuration running on the Jetbot, the system brings up the camera stream, marker detector, and motor driver in one step. From the laptop, RViz2 is used to verify:

- The live camera feed and the detection overlay.  
- The marker pose relative to the camera frame.  
- The velocity commands being published to the robot.

In practice, the Jetbot successfully orients itself toward a printed AR tag and drives forward until it reaches the target distance. The project demonstrates a full-cycle perception and control pipeline on an embedded platform, and serves as a foundation for learning more advanced behaviors such as multi-marker navigation or integration with additional localization sources.

### Demo

<!-- Jetbot navigation demo video -->
<div style="margin: 2rem 0;">
  <video
    controls
    style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 0 12px rgba(0,0,0,0.3);"
  >
    <source src="{{ site.baseurl }}/_projects/jetbot/visualTracking_demo.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>