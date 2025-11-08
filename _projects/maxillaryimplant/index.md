---
layout: post
title: Digitization, Design, and Development of a Maxillary Implant
description:  Created a patient-specific maxillary implant and denture from medical imaging data. Extracted anatomical data into a mesh to form a 3D model, refined the mesh for manufacturability, and produced an SLA 3D printed prototype.
skills: 
- Mesh Optimization
- NURBS Surface Modeling
- SLA 3D Printing
- Reverse Engineering
- ITK-SNAP
- Rhinoceros CAD
- Medical Image Segmentation
main-image: /headerComp.webp
---



## Goals

The purpose of this project was to gain a deeper understanding of how to reverse engineer design solutions with unique requirements. Anatomically informed implant design was chosen to fortify my experience in modeling with surfaces and meshes. While many workflows exist for generic implant modeling, very few clearly document a start-to-finish process beginning with raw medical imaging data. To explore this I developed a full work instruction that converts anatomical scans into 3D-printable implant geometries. The process outlines how to extract useful data, how to refine the mesh in CAD software, and how to optimize the fit and manufacturability of the resultant .STL file for SLA resin prototyping.

### Highlights
 - Digitization: MRI segmentation and DICOM to STL conversion using ITK-SNAP
 - Design: Mesh repair, NURBS conversion, and curvature analysis in Rhinoceros 3D CAD
 - Fabrication: SLA resin 3D printing and support optimization in Chitubox slicer



## Digitization

This process begins with DICOM files, which contain cross sectional images taken by an MRI machine. To view these files, and to isolate the teeth and jaw bones, medical image visualization and segmentation software is needed. ITK-SNAP was chosen as it is open-source and free to use.

### Segmentation

My goal is to convert the MRI data into a usable 3D model of the subject's maxilla and teeth. The scans were segmented to isolate this region of the data.

{% include image-gallery.html images="segmentation.png" %} <br>

One the region of interest is isolated, I contrast the region to visually separate hard bone tissue from softer tissues like skin and fat. With the teeth and maxilla are clearly differentiated from surrounding tissue, I used ITK-SNAP's thresholding feature to place region-growing nodes throughout the teeth and maxilla. 

{% include image-gallery.html images="isolation.png" %} <br>

{% include image-gallery.html images="thresholding.png" %} <br>

Once the software finished finding the edges of these regions, the clearly identified areas can be exported as a 3D model. Having a geometric surface model made it possible to analyze the subject's anatomy to design a form-fitting implant.

### Mesh Preparation



{% include image-gallery.html images="rawMesh.png" %} <br>

