# AI Usage & Development Log

**Project:** Dental AI Platform (Tiny Project)
**Student:** Kunal Jindal
**Date:** December 2025

---

## Overview
This document records the specific ways AI tools (ChatGPT-5.1 and GitHub Copilot) were utilized to accelerate development, bridge domain knowledge gaps, and optimize system architecture.

The usage is categorized into three phases: **Domain Research**, **Full-Stack Acceleration**, and **System Optimization**.

---

## 1. Domain Research (Radiology Ground Truth)
**Problem:** I needed to label 96 dental X-rays but lacked the medical expertise to distinguish impacted wisdom teeth from second molars in low-contrast images.

| Tool | Intent | Prompt / Methodology | Outcome |
| :--- | :--- | :--- | :--- |
| **ChatGPT-5.1** | **Domain Tutor** | *"I am building a computer vision dataset for wisdom teeth. Explain the visual markers on a panoramic X-ray (OPG) that distinguish a wisdom tooth from a molar. How do I count them?"* | The AI explained the "Palmer Notation" and the visual cue of counting from the midline. It helped me establish a strict labeling protocol (e.g., "Look for root angulation") which I applied in Roboflow. |
| **ChatGPT-5.1** | **Visual QA** | *[Uploaded a blurry sample X-ray]* *"Is there wisdom tooth in this image?"* | It pointed out the "bone coverage" over the distal part of the tooth, helping me classify it correctly as "Impacted." |

---

## 2. Full-Stack Acceleration (Boilerplate & UI)

| Tool | Intent | Prompt / Methodology | Outcome |
| :--- | :--- | :--- | :--- |
| **Copilot** | **Syntax Auto-fill** | *N/A (Inline Autocomplete)* | Heavily used for writing standard Flask boilerplate (CORS headers, route definitions) and React `useEffect` hooks for fetching data. |

---

## 3. System Optimization (Concurrency & Logic)

| Tool | Intent | Prompt / Methodology | Outcome |
| :--- | :--- | :--- | :--- |
| **ChatGPT-5.1** | **Debugging** | *"I am getting a 429 Resource Exhausted error from the Gemini API during my loop. How do I handle this gracefully without crashing the other 3 threads?"* | Provided the `try/except` block logic to catch specific API errors and return a "Rate Limit Reached" string instead of a 500 Server Error. |
| **ChatGPT-5.1** | **Debugging** | *"The detection bounding boxes are misaligned when the browser window resizes, and the chat overlay is clipping text. Fix the position: absolute calculations and Z-index layering."* | Automatically identified a conflict between the Canvas scaling logic and the CSS container. It provided a corrected Flexbox structure that ensured the overlay stayed perfectly aligned with the video feed on all screen sizes. |

---

## Summary of Impact
* **Time Saved:** Estimated 10-12 hours (primarily on CSS layout and labeling research).
* **Code Quality:** The AI helped implement robust error handling concurrency.
* **Scientific Integrity:** AI was used to *explain* the medical data, but the actual labeling was done manually by me to ensure the Ground Truth was verified by a human.
