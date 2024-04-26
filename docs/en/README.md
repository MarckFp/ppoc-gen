# PPOC Gen

## What is it?

PPOC Gen is an application designed to generate and administrate turns for the exhibitors of the Jehova's Witnesses. In fact, the acronym PPOC means Public Preaching Organized by the Congregation. In this app there is a set of concept that we should know before using it:

- Publisher: Is the user that would be assigned to a turn
- Schedule: Is the place and the time in which a turn takes place
- Turn: Is the exact day when the schedule is going to happen
- Assignments: Is the relationship between a publisher and a turn
- Incidences: Is the set of dates that a publisher cannot be placed in a turn
- Availability: Is the relationship between a publisher and a schedule establishing that in normal conditions that publisher can be assigned to turns on that schedule

This application was designed as a hobby and even if we give some type of support we cannot assure the correct behaviour 100% of the times. The app was designed to store the data locally. What does it mean? It means that neither us nor anyone have access to the data stored in your device. For this reason, it's impossible to enable the data sync between devices, that's why we've created the export and import feature, to learn more about that go to the section [How to export and import data?](#how-to-export-and-import-data)


## Creating a Schedule

The ideal first step is to create the schedules of our congregation. To do that we should click on the menu "Schedules" > "Create new Schedule", after that we should input some data like:

- Week day that it usually takes place
- Location or ubication where it normally happens
- Start time and end time
- Number of brothers that should be on that schedule
- Number of sisters that should be on that schedule

After clicking the button "Create" we should have our first Schedule.

## Creating a Publisher

After creating the schedules the next logic step is to create the publishers. Remember that you should create yourself on the application if you participate in this field. To do that we should click on the menu "Publishers" > "Create new Publisher" and the form to create a new one should appear. We should fill the following data:

- Firstname
- Surname
- Gender
- Priority: Is the frequency the app will try to assign this publisher. To better understanding you can read the section [How the turn generation works?](#how-the-turn-generation-works)
- Affinity: If the publisher, for example, is married or has kids it would be reccomended to fill this field because the app will try to assign those people together on the turns
- Availability: What schedules can cover that publisher

## Creating Incidences

Something we can do is to create an incidence, a set of dates in which certain publisher (or even the whole congregation) cannot be assigned to a turn. This is very useful for holidays, medic appointments, etc To do that we should click on the menu "Incidences" > "Create new Incidence" and after filling all the data the app will ignore that publisher on those dates when you generate the turns. Something to take in mind is that the Start Date and the End Date are inclusives, it means neither of those two dates the publisher is going to have a turn. If we wish to configure an incidence congregation-wide (Like for example conventions or dates when the congregation doesn't place exhibitors) the only thing to do is at the time of creating an incidence in the field "Publisher" select "The entire congregation"

## Creating Turns

To create turns we can make it in two ways: Generate them or create them manually. To do that we should click "Turns" > and decide what method use:

- **Manually**: This is very useful to create quick turns, the app is not going to use the priority or the availability of the publisher since the turn is generated manually by you. We fill the data like the date, times, assigned publishers and location if you want.
- **Generate**: To take this approach we should input the start date and the end date and after clicking the "Generate turns", the app will automatically try to generate from 0 the turns for the given range of dates. In case of any error like the lack of brothers or sisters it will trigger an alert to make you notice.

### How the turn generation works?

Atention, this section is slightly more technical than the rest of the documentation since we focus on the behaviour of the app engine and how it works under it, and the calculations it makes.

To understand how the app generates the turns first we should understand how the priority of the publishers works. The priority is divided in 4: high, medium, low and advanced. Each one of this assign a number to each publisher, the advanced one let us modify that number manually. For example high assigns number 1, medium assigns number 2 and low assigns number 3. This value means the frequency a publisher is assigned to a turn.

Each publisher internally has a number, aside from the priority, called counter, that means the number of times a publisher is assigned to an exhibitor. Each time the publisher is assigned to a turn the counter will add the priority to that number, and the app is always trying to assign publishers with the lowest counter possible. For example: A publisher A have a high priority (1) and a publisher B have a low priority (3). Each time publisher B is assigned (1 turn * 3 priority = 3) it will have 3 turns the publisher A (3 turns * 1 priority = 3). In this way we can handle priorities and with advanced ones we can adjust the frequency we desire.

Under the app it works in this sequence of steps to assign turns:

1. It loops from the first day established untile the last one
2. It checks if there is a congregation-wide incidence, if it is it continues with the next day
3. Then it check if in that day there are schedules created, if they are but there are no turns yet created it just creates one
4. After that it checks which users have availability to that schedule
5. It sorts the users with the lowest counter first and it checks if the user has an incidence, if it does it continues to the next user
6. If the user doesn't exist on any turn on that day or the day before it assigns it to the turn
7. Finally if the user has affinities and there is room on the turn it assigns the affinity to the turn

## How to export and import data?

### Export

To export we should click in the menu "Settings" > "Export Data", this will generate us a file ended with the file extension .pgen with all the information of our congregaiton (publishers, schedules, incidences, turns, settings...)

### Import

To import we should clikc in the menu "Settings" > "Import Data", then a dialog should appear asking to input the desired file that we want to import. Be very careful since all the data will be deleted and overrwritten by the new data, so only do this if you really want to loose your date since it's not possible to recover it.
