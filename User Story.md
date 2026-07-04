<!--
Source: https://tuantrinh0711.atlassian.net/wiki/spaces/F/pages/12746759
Confluence page: User Story
Downloaded: 2026-06-20
-->

# Workout Tracking

## Create Workout

**User Story**

As a gym member, I want to create a workout session so that I can keep a record of my training activities.

**Acceptance Criteria**

* Given I am on the dashboard
* When I click the **"New Workout"** button
* Then a workout creation form should be displayed
* When I enter a workout name and click **"Create Workout"**
* Then a new workout session should be created
* And the workout should appear in my workout list

---

## Add Exercise to Workout

**User Story**

As a gym member, I want to add exercises to my workout so that I can track my training activities.

**Acceptance Criteria**

* Given I have an existing workout
* When I click the **"Add Exercise"** button
* Then an exercise search modal should appear
* When I select an exercise
* Then the exercise should be added to the workout
* And the exercise should appear in the workout details page

---

## Log Sets

**User Story**

As a gym member, I want to record sets, reps, and weights so that I can measure my performance.

**Acceptance Criteria**

* Given an exercise exists in a workout
* When I click the **"Add Set"** button
* Then a new set row should be displayed
* When I enter reps and weight
* And click **"Save Set"**
* Then the set information should be stored
* And the workout summary should update

---

# Nutrition Tracking

## Log Meal

**User Story**

As a health-conscious user, I want to log meals so that I can track my calorie intake.

**Acceptance Criteria**

* Given I am on the nutrition page
* When I click the **"Add Meal"** button
* Then a meal form should appear
* When I enter meal information and click **"Save Meal"**
* Then the meal should be stored
* And total daily calories should be recalculated

---

## Add Food Item

**User Story**

As a health-conscious user, I want to add food items to a meal so that I can calculate nutritional values.

**Acceptance Criteria**

* Given a meal exists
* When I click the **"Add Food"** button
* Then a food search dialog should open
* When I select a food item and serving size
* Then calories and macros should be calculated automatically
* And the food item should appear in the meal details

---

# Goal Tracking

## Create Weight Goal

**User Story**

As a fitness enthusiast, I want to set a target weight so that I can monitor my progress.

**Acceptance Criteria**

* Given I am on the Goals page
* When I click the **"Create Goal"** button
* Then a goal form should be displayed
* When I enter a target weight and target date
* And click **"Save Goal"**
* Then the goal should be stored
* And the goal progress card should appear on the dashboard

---

# Progress Tracking

## Log Body Weight

**User Story**

As a fitness enthusiast, I want to record my body weight so that I can monitor changes over time.

**Acceptance Criteria**

* Given I am on the Progress page
* When I click the **"Log Weight"** button
* Then a weight entry form should appear
* When I enter my current weight and click **"Save"**
* Then the weight entry should be stored
* And the progress chart should update

---

# Search

## Search Fitness Content

**User Story**

As a fitness user, I want to search workouts, exercises, meals, food items, goals, weight entries, reports, and training plans so that I can quickly find existing records and reuse relevant fitness information.

**Acceptance Criteria**

* Given I am using the application
* When I enter a search term in the global search field
* Then the system should return matching records grouped by content type
* And each result should include the record type, title, matching summary, and relevant date
* When I filter by a content type
* Then only matching records from that type should be returned
* When I search by partial text
* Then records with names, notes, goals, or plan content containing the search term should be returned
* When no records match the search term
* Then an empty state should be returned with a clear message
* And search requests should support pagination so large result sets can be browsed safely

---

# Analytics & Reporting

## Generate Weekly Report

**User Story**

As a fitness enthusiast, I want to generate a weekly fitness report so that I can review my performance and habits.

**Acceptance Criteria**

* Given I have workout and nutrition data
* When I click the **"Generate Report"** button
* Then the system should calculate weekly statistics
* And display workout frequency
* And display calories consumed
* And display weight changes
* And display goal completion percentage

---

# AI Workout Plan

## Generate Training Plan

**User Story**

As a fitness enthusiast, I want the system to generate a workout plan so that I can follow a structured training program.

**Acceptance Criteria**

* Given I have completed my fitness profile
* When I click the **"Generate Plan"** button
* Then the system should analyze my goals
* And create a personalized workout plan
* And display the generated plan
* And allow me to save it to my account

