For the final project, I want to try 3D things. I choose making something in Unreal Engine 5.3.

Recently, I watched some pictures recording the scene in the ocean. I was fascinated by the beauty of the lanscape under water. Then, I decided to depict such scene in my final project. For achieving this, I need to implement the boid simulation for my fish, underwater post-processing effect and other decorations.

The link of my final outcome: [Fish Flock](https://youtu.be/VPbRd0oR2uo?si=eCp-bTV2jCp-i9gY).

# Fish
Implementing a boids simulation for fish isn't particularly challenging. I simply defined the five boid rules within the Niagara Module Script (NMS), incorporated some curl noise, and set initial velocity for my particles. NMS functions similarly to the blueprint system but is specialized for particles. Through NMS customization, I gained access to manage nearly every particle within the system. Additionally, I was able to write vertex shaders in HLSL within NMS. So, I make the moving pattern of fish flock.

Additionally, in NMS, I used audio amplitude as the input to control the intensity of the curl noise in the flock and the brightness of each individual fish. However, this effect may not be very noticeable in the video.

Within the fish shader, I enhance the brightness and vibrancy of the fish flock using the Fresnel function and a normal map derived from the diffuse color texture in Photoshop. This modification renders the fish more prominent and vivid in the scene. Additionally, I performed mathematical calculations based on the current positions of each individual fish. By applying the results to the world position offset, the particles move in a manner that closely resembles the natural behavior of a fish flock.

# post-processing effect
My post-processing effect in this project includes several parts: distortion effect, lens effect, blur effect and underwater fog effect. 

- distortion effect is achieved by adding the uv of current rendering scene with some noise. One thing we should noticed is that the intensity of the noise should not be too high. Otherwise everything will look weird.
- The lens effect can be achieved by interpolating various UV sizes within the current scene, based on a circular mask. However, utilizing this effect may cause the scene to appear somewhat blurry. I haven't yet figured out how to address this issue.
- The principle of blur effect is quite straightforward: just mix every pixel with other pixels surround it. In my shader, I sampled 7 pixels and maked the final effect.
- The underwater fog effect is created by calculating the distance between every object in the scene and the camera. This calculation generates a mask. I utilized this mask as the factor for interpolating the scene's color with the fog color, which I chose as a deep shade of blue.

# Decoration
To make the scene resemble a real ocean more closely, I incorporated some bubble particles and water caustics. The shaders for these elements are relatively straightforward. For the bubbles, I employed two noise textures to deform their shapes. In the water caustics shader, I repeatedly sampled the same texture and animated them using various parameters, creating a final result with a randomized appearance. I didn't emphasize these two elements excessively as their purpose is to contribute to the ambiance of being in the ocean.

Finally, I added one point light and one spot light to the scene. Simultaneously, I reduced the intensity of the directional light in the scene. This approach enhances the visibility of my fish flock. Thus, I finished my stage!

# Problem Unsolved
Initially, I wanted to implement the bloom effect independently, without utilizing the built-in method. Based on my current understanding, the bloom effect can be achieved by overlaying a low-resolution scene texture multiple times atop our primary scene. For instance, when applying the bloom effect to an image, we can duplicate the image, create a more blurred version of the duplicate, and then blend these two images together. However, I encountered challenges in obtaining or generating a low-resolution version of the current scene. I extensively searched through various tutorials and instructions, but they all seemed to be tailored for Unity. Moreover, to the best of my knowledge, the engine's developers discourage manual implementation of this feature. As a result, I opted not to pursue the bloom effect on my own.
