INSERT INTO Tags (tagName, createdAt, updatedAt) 
VALUES("Comedy", now(), now()), 
("Horror", now(), now()), 
("Romance", now(), now()), 
("Tragedy", now(), now()), 
("Mystery", now(), now()), 
("Sci-Fi", now(), now());

INSERT INTO Users (createdAt, updatedAt, oAuthKey, displayName) 
VALUES(now(), now(), "randomkey1", "bestAuthorEver"), 
(now(), now(), "randomkey2", "secondBestAuthor");

INSERT INTO Stories (createdAt, updatedAt, title, isPublic, isFinished, chooseNotToWarn, violence, nsfw, nonConsent, characterDeath, profanity, AuthorId) 
VALUES(now(), now(), "The Morning Shift", true, true, false, false, false, false, false, false, 1),
(now(), now(), "Sample Story", true, true, false, true, true, false, true, true, 2);

INSERT INTO StoryTag (createdAt, updatedAt, StoryId, TagId)
VALUES (now(), now(), 1, 1),
(now(), now(), 2, 2),
(now(), now(), 2, 5);

INSERT INTO Pages (createdAt, updatedAt, AuthorId, StoryId, isLinked, contentFinished, isStart, isEnding, title, content) 
VALUES(now(), now(), 1, 1, true, true, true, false, "Story 1 Page 1", 
"From the kitchen you can hear the last guests in the café finishing up their meals and the clinks and clanks of dirty coffee cups and plates being stacked in the dishwasher. 
You started at this café almost six months ago and you absolutely love it. 
The crew are fun, the hours are great and, well, you are pretty good at it too. 
The morning shift is just about over so it’s time to get stuck into the changeover. 
That means making sure all the prep work is done for the afternoon shift to come in. 
Even though you know the tasks off by heart, you get the changeover checklist from the folder and get started. 
The first job is to prep enough tomatoes for the afternoon team to make it through the rest of the day. 
You get a box of fresh tomatoes from the fridge and take the knife down from the magnetic strip on the back wall. 
As you go to cut through the first tomato the knife doesn’t even pierce the skin. This knife is seriously blunt. " ),
(now(), now(), 1, 1, true, true, false, false, "Story 1 Page 2", 
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
here are antibiotics to stop infection.’ "),
(now(), now(), 1, 1, true, true, false, true, "Story 1 Page 3", 
"Two weeks later, the wound is fully closed but the thumb has not regained full feeling.
After a visit to the doctor’s office there is more bad news.
‘One of the nerves you hit hasn’t recovered as we expected. 
With a lot of physiotherapy and daily exercises, you should gain
most of the feeling back, but it is unlikely to ever be 100%.’ 
There is no way to tell how the limited movement in your thumb will affect
your ability to perform certain tasks in the future."),
(now(), now(), 1, 1, true, true, false, false, "Story 1 Page 4", 
"Jamie is the chef on shift this morning and is still finishing the last orders for lunch. 
Can you give me a hand Chef? This knife is really blunt. Chef replies, ‘I’ll just be a minute.’ 
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
You are about to make some space in the stock room when you notice a puddle of water on the floor outside the fridge."),
(now(), now(), 1, 1, true, true, false, false, "Story 1 Page 5", 
"Mopping only takes you a minute and now you can get this stock moved.
You have just got to move these boxes and you are done.
The boss did say to use the trolley but these boxes are not particularly heavy.
You decide to:"),
(now(), now(), 1, 1, true, true, false, false, "Story 1 Page 6",
"While you are walking over to the stock, your foot slips making your heart jump and oddly it
feels like slow motion as you watch, the floor getting closer and closer. You try and get your
arms out in front of you but there is no use. You hit the floor and there is an intense pain through
your right arm, all the way up to your shoulder. You hear a noise, just like a carrot snapping.
Instinctively, you cradle your arm, but you don’t even have to look at it to know your wrist is broken. 
It hurts so much you can’t even cry. 
There are people at your side, yelling instructions but you can’t focus. You wish they would just be quiet.
It seems like no time before the ambulance officers are there and asking you a hundred questions. 
I just want this pain to stop! You snap back.
They get you into the ambulance and off to hospital. X-rays confirm what you already suspected. 
Your wrist is broken in two places.
Your arm is put in plaster and secured tightly with a sling.
With the help of the doctors, the pain has subsided and they let you go home.
Sitting in the quiet of the car as your Mum is driving home, you start crying,
Why didn't I just clean up that stupid puddle!"),
(now(), now(), 1, 1, true, true, false, true, "Story 1 Page 7",
"You were supposed to head to the beach tomorrow with the girls. It’s the
last trip of the summer and now you’re going to miss it!"),
(now(), now(), 1, 1, true, true, false, false, "Story 1 Page 8",
"You stack three boxes up in your arms and head into the storeroom. The boxes are
a little heavier than you thought and as you try to negotiate your way towards the
shelves you need to juggle them a bit to keep balanced. Out of nowhere a pain shoots
up your back and takes your breath away.
It feels like someone has stuck a knife through your lower spine. The boxes fly out
of your hands and crash on the floor as Jules runs in to see what’s going on.
The pain is so bad you can hardly talk, but you manage a squeak, My back!
She calls an ambulance.
When paramedics arrive it takes an eternity to get onto the stretcher.
‘Don’t rush it love, we can take as long as you need.’
How embarrassing you think to yourself.
After hours of tests, x-rays and waiting around the doctor gives you the diagnosis.
‘You have a serious sprain in your lower back. We’ll need to keep you in overnight
for observation followed by a minimum of two weeks bed rest. I’ll give you some
medication to reduce the pain and swelling.’ "),
(now(), now(), 1, 1, true, true, false, true, "Story 1 Page 9",
"The trolley is the best. Not only is it
safer than carrying all those boxes, it’s easier.
There is no need to work up a sweat at the end of the shift.
It may have taken an extra couple of minutes, but that doesn’t matter.
You get that great feeling when you put the last of the boxes away and
you have a couple of days off to look forward to! "),
(now(), now(), 1, 1, true, true, false, true, "Story 1 Page 10",
"You miss touch footy finals and can’t even watch from the sidelines. Bed rest is seriously boring!"),
(now(), now(), 2, 2, true, true, true, false, "Story 2 Page 1", 
"Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
It has survived not only five centuries, but also the leap into electronic typesetting, 
remaining essentially unchanged. 
It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."), 
(now(), now(), 2, 2, true, true, false, false, "Story 2 Page 2", 
"It is a long established fact that a reader will be distracted 
by the readable content of a page when looking at its layout. 
The point of using Lorem Ipsum is that it has a more-or-less normal 
distribution of letters, as opposed to using 'Content here, content here', 
making it look like readable English. Many desktop publishing packages and 
web page editors now use Lorem Ipsum as their default model text, and a search for 
'lorem ipsum' will uncover many web sites still in their infancy. 
Various versions have evolved over the years, sometimes by accident, 
sometimes on purpose (injected humour and the like)."), 
(now(), now(), 2, 2, true, true, false, true, "Story 2 Page 3", 
"This is the end to the first path of Sample Story!"),
(now(), now(), 2, 2, true, true, false, false, "Story 2 Page 4", 
"Contrary to popular belief, Lorem Ipsum is not simply random text. 
It has roots in a piece of classical Latin literature from 45 BC, 
making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, 
looked up one of the more obscure Latin words, consectetur, 
from a Lorem Ipsum passage, and going through the cites of the word in classical literature, 
discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum'
 (The Extremes of Good and Evil) by Cicero, written in 45 BC. 
 This book is a treatise on the theory of ethics, very popular during the Renaissance. 
 The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32."), 
 (now(), now(), 2, 2, true, true, false, true, "Story 2 Page 5", 
 "This is the end to the second path of Sample Story!");

INSERT INTO Links (createdAt, updatedAt, AuthorId, StoryId, FromPageId, ToPageId, linkName)
VALUES (now(), now(), 1, 1, 1, 2, "You're too lazy to sharpen the knife. Just keep using it."),
(now(), now(), 1, 1, 1, 4, "Ask the chef to sharpen the knife for you."),
(now(), now(), 1, 1, 2, 3, "Continue"),
(now(), now(), 1, 1, 4, 5, "Grab the mop and clean it up."),
(now(), now(), 1, 1, 4, 6, "Ignore it, you didn't spill it so why should you clean it?"),
(now(), now(), 1, 1, 6, 7, "Continue"),
(now(), now(), 1, 1, 5, 8, "You're strong! Just carry the boxes into the storeroom."),
(now(), now(), 1, 1, 5, 9, "Use the trolley, that's what it's for!"),
(now(), now(), 1, 1, 8, 10, "Continue"),
(now(), now(), 2, 2, 11, 12, "Let's turn left here!"),
(now(), now(), 2, 2, 12, 13, "Continue"),
(now(), now(), 2, 2, 11, 14, "Let's turn right here!"),
(now(), now(), 2, 2, 14, 15, "Continue");