# New-Caches

Geocaching is an open-air fun activity with many adepts. This project consists in the development of a web application to help the user find good locations to place new caches. A file is provided with the historical geocaching data of the municipality of Almada (the file is a bit outdated because contains the data available in 2017.)

With the widespread use of GPS receivers, there are more and more games and activities taking advantage of the possibility of determining the coordinates of the current location. This promotes outdoor fun and physical activity for the whole family.

Here are some of these games and activities that use GPS: Geodashing, Degree Confluence Project, Benchmarking, Wherigo, Geocaching, Waymarking, Ingress, Pokémon GO.

Geocaching is the oldest of these games, with more than one million active players and more than three million geocaches worldwide. In Portugal there are more than 50000 players and more than 70000 geocaches available.

Geocaching consists in finding physical treasures (called geocaches or more simply caches) which are hidden in supposedly interesting locations. Some physical activity is often involved in reaching those locations. In English, the word "cache" is synonymous with "treasure", "hideout" and "stash".

A typical cache is a waterproof container containing a logbook and some small goodies that the visitor can exchange. The player discovers the container, signs the logbook, and hides back the container. Later, at home, the player writes an electronic log at the geocaching site to share their experiences with the others.

On the map, draw many circles with a radius of 161 meters (there is a constant already defined):

All caches with a known physical location obtained from the original file must be drawn with a red circle around them;
All caches with a physical location assigned manually by the user must be drawn with a green circle around them;
All caches with a physical location assigned automatically by the application must be drawn with a blue circle around them;
All caches without known physical location do not have a circle drawn around; 

On the map, clicking on a cache icon makes a balloon appear with all the information available about that cache. In this balloon, four links (or buttons) also appear:

the first one opens the cache page on the geocaching.com site (for example, https://coord.info/GC2J445);
the second opens Google Maps in Street View mode at the cache coordinates (for example, http://maps.google.com/maps?layer=c&cbll=38.659917, -9.202417);
the third one allows the user to set or change the coordinates of a cache with secret physical location (applies to Multicache, Mystery, Letterbox), and also allows changing the coordinates of a Traditional cache that has been created manually or automatically (when the coordinates of a cache change, the placement of the icon in the screen changes accordingly.)
the fourth allows the user to delete a Traditional cache that has been created manually or automatically. 

On the map, clicking outside any cache icon causes a balloon to appear indicating the coordinates of the clicked position. There are also two links (or buttons) in this balloon:

the first opens Google Maps in Street View mode at the indicated coordinates;
the second allows the user to create a Traditional cache at the indicated coordinates, as long as the system invariants are respected (in case of invariant violation, present an alert box with an error message). 

On the left control panel there is a small section with some statistics about the caches currently displayed: for example, the number of caches of each kind; the most prolific owner, the cache with highest altitude (note that the special altitude "-32768" means "unknown altitude"), etc. Do not forget to update the statistics when a Traditional cache is created or deleted.

On the left control panel there is a button to automatically create a new Traditional cache at a valid location. The time allowance for searching for a valid position is 1 second.

On the left control panel there is a button to automatically create as many Traditional cache as possible, all with valid locations. The time allowance for each cache is 1 second. At the end, an alert box must tell how many caches have been successfully created. The graphical animation of the caches creation algorithm will be valued.

This is a list of invariants that the program must respect:

  - A strict rule in geocaching is that two physical containers must be at least 161 meters apart. To refer to the coordinates of a physical container, sometimes we will use the terms "physical coordinates" or "physical location".
  - The program loads and displays on the screen all active caches from the file. The archived caches in the file are ignored. None of the caches originally loaded from file and placed in the map can be deleted by the user.
  - Traditional caches have special privileges. It is possible to create new Traditional caches, manually or automatically. Those newly created Traditional caches are considered temporary and can be deleted by the user. It is not possible to create new caches other than Traditionals.
  - The Traditional caches have physical containers with known location. The Traditional caches loaded from the file have coordinates that the user cannot change. As for Traditional caches created manually or automatically, the user can change their coordinates.
  - Caches of the kinds Multicache, Mystery, Letterbox also have physical containers, but the location of the container is secret. The user can assign physical coordinates of these kinds of caches to reflect the real physical location.
  - Caches of other kinds do not have physical containers. It is not possible to change their coordinates.
  - When creating a new Traditional cache, we obviously need to respect the rule of minimum distance of 161 meters between physical coordinates. But does that mean that we can create the new cache on any remote part of planet Earth? Of course, we do not want that? We now introduce the additional rule that any new cache must be created within 400 meters of a Traditional cache that was originally loaded from the data file.
  
 ----------------------------------------------------
 Demo: https://gui28f.github.io/New-Caches/
