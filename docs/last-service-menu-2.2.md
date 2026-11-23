# Last Service menu entry 2.2

The level-select page now has THE LAST SERVICE as the fourth choice, after the object gallery and before BACK. It starts the hosted scene registered as last-service in the existing scene host, on the shared game canvas. There is no page navigation and no second game loop.

Exit uses the scene-owned button inside the prologue. The host restores canvas size, reopens the main menu and disposes the scene once. Startup errors restore the menu and show PROLOGUE COULD NOT START.

Requires the 2.1 mount, scope and loading-screen changes. Real-browser acceptance and full CI remain required.
