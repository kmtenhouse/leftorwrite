INSERT INTO Tags (tagName, createdAt, updatedAt) 
VALUES("Comedy", now(), now()), 
("Horror", now(), now()), 
("Romance", now(), now()), 
("Tragedy", now(), now()), 
("Mystery", now(), now()), 
("Sci-Fi", now(), now());

INSERT INTO Stories (createdAt, updatedAt, title, isPublic, isFinished, chooseNotToWarn, AuthorId) 
VALUES(now(), now(), "The Morning Shift", true, true, true, 1);

INSERT INTO Pages (createdAt, updatedAt, AuthorId, StoryId, isLinked, contentFinished, isStart, title, content) 
VALUES(now(), now(), 1, 1, true, true, true, "Story 1 Page 1", 
"From the kitchen you can hear the last guests in the café finishing up their meals and the clinks and clanks of dirty coffee cups and plates being stacked in the dishwasher. 
You started at this café almost six months ago and you absolutely love it. 
The crew are fun, the hours are great and, well, you are pretty good at it too. 
The morning shift is just about over so it’s time to get stuck into the changeover. 
That means making sure all the prep work is done for the afternoon shift to come in. 
Even though you know the tasks off by heart, you get the changeover checklist from the folder and get started. 
The first job is to prep enough tomatoes for the afternoon team to make it through the rest of the day. 
You get a box of fresh tomatoes from the fridge and take the knife down from the magnetic strip on the back wall. 
As you go to cut through the first tomato the knife doesn’t even pierce the skin. This knife is seriously blunt. " );

INSERT INTO Pages (createdAt, updatedAt, AuthorId, StoryId, isLinked, contentFinished, title, content) 
VALUES(now(), now(), 1, 1, true, true, "Story 1 Page 2", 
"The blunt knife is really struggling to cut through the skin of the tomato.
To compensate, you push down a little harder on the knife. As you pull the knife back,
it slips and plunges straight into the webbing between your thumb and index finger.
OMG! You immediately let go of the knife and scream. Ahhhhh!!!
Within seconds your left hand is covered in blood and you know it’s deep.
Jamie, the chef, comes running over and immediately wraps your hand tightly in a
towel. Tears are running down your face and your hand is shaking like crazy.
‘You are going to be all right. Just breathe deeply. We’ll get you to the hospital and get
you fixed up,’ Jamie says. It all happens so quickly.
Within half an hour you are sitting with a doctor. ‘The wound needed 22 stiches, and
here are antibiotics to stop infection.’ ");

INSERT INTO Pages (createdAt, updatedAt, AuthorId, StoryId, isLinked, contentFinished, isEnding, title, content) 
VALUES(now(), now(), 1, 1, true, true, true, "Story 1 Page 3", 
"Two weeks later, the wound
is fully closed but the thumb
has not regained full feeling.
After a visit to the doctor’s
office there is more bad news.
‘One of the nerves you hit
hasn’t recovered as we
expected. With a lot of
physiotherapy and daily
exercises, you should gain
most of the feeling back, but
it is unlikely to ever be 100
per cent.’ There is no way to tell how the limited movement in your thumb will affect
your ability to perform certain tasks in the future.");

INSERT INTO Pages (createdAt, updatedAt, AuthorId, StoryId, isLinked, contentFinished, title, content) 
VALUES(now(), now(), 1, 1, true, true, "Story 1 Page 4", 
"Jamie is the chef on shift this morning and is still finishing the last orders for lunch. 
Can you give me a hand Chef? 
This knife is really blunt. 
Chef replies, ‘I’ll just be a minute.’ 
By the time you get back to your prep bench Chef is right behind you and happy to sharpen the knife. 
He’s going a hundred miles an hour and you can tell by watching that it’s a task that he’s had loads of experience with. ‘
Did you know it’s more dangerous to use a blunt knife than it is a sharp one? I’ve seen a lot of workers make that mistake and end up almost taking their thumb off!’ 
Jamie says and hands you the knife. You still feel a little shy asking for help, but you always learn something. 
Thanks Chef. Yeah, I know. A blunt knife can do some serious damage. 
With the knife now nice and sharp you can safely and easily finish prepping the tomatoes. 
Your supervisor comes over to let you know one of the other workers, Jules, is going to finish the changeover. 
‘A delivery of new stock has come in and I’d like you to get it put away in the stock room,’ she says and points to a pile of boxes. 
‘Use the trolley and once you’ve done that, you can clock off.’ 
Sweet! Early knock off here I come! 
You are about to make some space in the stock room when you notice a puddle of water on the floor outside the fridge.");

INSERT INTO Links (createdAt, updatedAt, AuthorId, StoryId, FromPageId, ToPageId, linkName)
VALUES (now(), now(), 1, 1, 1, 2, "You're too lazy to sharpen the knife. Just keep using it.");

INSERT INTO Links (createdAt, updatedAt, AuthorId, StoryId, FromPageId, ToPageId, linkName)
VALUES (now(), now(), 1, 1, 1, 4, "Ask the chef to sharpen the knife for you.");