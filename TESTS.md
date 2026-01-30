# User API
## Admin operations
- Test: admin can create a new user | Route: POST /admin/create | Expected HTTP: 201 | Reqs: RF-6
- Test: admin create rejects non-string fields | Route: POST /admin/create | Expected HTTP: 400 | Reqs: RF-6
- Test: non-admin cannot create a new user | Route: POST /admin/create | Expected HTTP: 403 | Reqs: RF-6; RNF-02
- Test: admin can get users with filters | Route: GET /admin/get | Expected HTTP: 200 | Reqs: RF-7
- Test: admin can update a user | Route: PUT /admin/update/:id | Expected HTTP: 200 | Reqs: RF-8
- Test: admin update rejects non-string fields | Route: PUT /admin/update/:id | Expected HTTP: 400 | Reqs: RF-8
- Test: admin can delete a user | Route: DELETE /admin/delete/:id | Expected HTTP: 200 | Reqs: RF-9
## Normal user operations (safe endpoints)
- Test: student can get list of users (excluding admins) | Route: GET /user/get | Expected HTTP: 200 | Reqs: RF-7
- Test: student can get own profile | Route: GET /user/me | Expected HTTP: 200 | Reqs: RF-7
- Test: student can update own profile | Route: PUT /user/update | Expected HTTP: 200 | Reqs: RF-8
- Test: student update rejects non-string fields | Route: PUT /user/update | Expected HTTP: 400 | Reqs: RF-8
- Test: student can delete own account | Route: DELETE /user/delete | Expected HTTP: 200 | Reqs: RF-9
- Test: student cannot access admin-only safe endpoints | Route: GET /admin/get/:id | Expected HTTP: 403 | Reqs: RNF-02
## Get by username
- Test: student can safely get another non-admin user by username | Route: GET /user/get-by-username/:username | Expected HTTP: 200 | Reqs: RF-4; RF-7
- Test: student cannot view admin details | Route: GET /user/get-by-username/:username | Expected HTTP: 403 | Reqs: RNF-02
- Test: rejects blank username | Route: GET /user/get-by-username/ | Expected HTTP: 400 | Reqs: RF-4; RF-7

# Auth API
## POST /auth/register
- Test: registers a new user and returns a token | Route: POST /auth/register | Expected HTTP: 201 | Reqs: RF-1
- Test: rejects duplicate usernames | Route: POST /auth/register | Expected HTTP: 400 | Reqs: RF-1
- Test: rejects non-string fields | Route: POST /auth/register | Expected HTTP: 400 | Reqs: RF-1
## POST /auth/login
- Test: logs in an existing user | Route: POST /auth/login | Expected HTTP: 200 | Reqs: RF-2
- Test: rejects invalid credentials | Route: POST /auth/login | Expected HTTP: 400 | Reqs: RF-2
- Test: rejects non-string username/password | Route: POST /auth/login | Expected HTTP: 400 | Reqs: RF-2
## POST /auth/refresh-token
- Test: refreshes token with valid auth header | Route: POST /auth/refresh-token | Expected HTTP: 200 | Reqs: RF-2
- Test: rejects missing token | Route: POST /auth/refresh-token | Expected HTTP: 401 | Reqs: RNF-02

# Assignment API
## Create assignment
- Test: coach can create a new assignment for their group | Route: POST /assignment/create | Expected HTTP: 201 | Reqs: RF-22
- Test: coach cannot create assignment for another coach's group | Route: POST /assignment/create | Expected HTTP: 403 | Reqs: RF-22; RNF-02
- Test: admin can create a new assignment for any group | Route: POST /assignment/create | Expected HTTP: 201 | Reqs: RF-22
- Test: student cannot create an assignment | Route: POST /assignment/create | Expected HTTP: 403 | Reqs: RF-22; RNF-02
- Test: unauthenticated user cannot create assignment | Route: POST /assignment/create | Expected HTTP: 401 | Reqs: RNF-02
- Test: returns 400 for missing title | Route: POST /assignment/create | Expected HTTP: 400 | Reqs: RF-22
- Test: returns 400 for missing parent_group | Route: POST /assignment/create | Expected HTTP: 400 | Reqs: RF-22
- Test: returns 400 for invalid group | Route: POST /assignment/create | Expected HTTP: 400 | Reqs: RF-22
## Create assignment with exercises
- Test: coach can create a new assignment with exercises for their group | Route: POST /assignment/create-with-exercises | Expected HTTP: 201 | Reqs: RF-22; RF-26
- Test: coach cannot create assignment with exercises for another coach's group | Route: POST /assignment/create-with-exercises | Expected HTTP: 403 | Reqs: RF-22; RF-26; RNF-02
- Test: admin can create a new assignment with exercises for any group | Route: POST /assignment/create-with-exercises | Expected HTTP: 201 | Reqs: RF-22; RF-26
- Test: student cannot create an assignment with exercises | Route: POST /assignment/create-with-exercises | Expected HTTP: 403 | Reqs: RF-22; RF-26; RNF-02
- Test: unauthenticated user cannot create assignment with exercises | Route: POST /assignment/create-with-exercises | Expected HTTP: 401 | Reqs: RNF-02
- Test: returns 400 for missing title | Route: POST /assignment/create-with-exercises | Expected HTTP: 400 | Reqs: RF-22
- Test: returns 400 for missing parent_group | Route: POST /assignment/create-with-exercises | Expected HTTP: 400 | Reqs: RF-22
- Test: returns 400 for missing exercises | Route: POST /assignment/create-with-exercises | Expected HTTP: 400 | Reqs: RF-22; RF-26
- Test: returns 400 for invalid group | Route: POST /assignment/create-with-exercises | Expected HTTP: 400 | Reqs: RF-22
- Test: returns 400 for invalid exercise data | Route: POST /assignment/create-with-exercises | Expected HTTP: 400 | Reqs: RF-26
- Test: returns 400 for invalid cf_code | Route: POST /assignment/create-with-exercises | Expected HTTP: 400 | Reqs: RF-26
## Get assignments
- Test: coach can get their own assignments | Route: GET /assignment/get | Expected HTTP: 200 | Reqs: RF-23
- Test: coach cannot get another coach's assignments | Route: GET /assignment/get | Expected HTTP: 200 | Reqs: RF-23
- Test: student can get assignments for groups they belong to | Route: GET /assignment/get | Expected HTTP: 200 | Reqs: RF-23
- Test: admin can get all assignments | Route: GET /assignment/get | Expected HTTP: 200 | Reqs: RF-23
- Test: unauthenticated user cannot get assignments | Route: GET /assignment/get | Expected HTTP: 401 | Reqs: RNF-02
## Get assignment by id
- Test: coach can get their own assignment by id | Route: GET /assignment/get/:id | Expected HTTP: 200 | Reqs: RF-23
- Test: coach cannot get another coach's assignment | Route: GET /assignment/get/:id | Expected HTTP: 403 | Reqs: RF-23; RNF-02
- Test: student can get assignment for group they belong to | Route: GET /assignment/get/:id | Expected HTTP: 200 | Reqs: RF-23
- Test: student cannot get assignment for group they don't belong to | Route: GET /assignment/get/:id | Expected HTTP: 403 | Reqs: RF-23; RNF-02
- Test: admin can get any assignment by id | Route: GET /assignment/get/:id | Expected HTTP: 200 | Reqs: RF-23
- Test: returns 404 for non-existent assignment | Route: GET /assignment/get/:id | Expected HTTP: 404 | Reqs: RF-23
- Test: unauthenticated user cannot get assignment | Route: GET /assignment/get/:id | Expected HTTP: 401 | Reqs: RNF-02
## Update assignment
- Test: coach can update their own assignment | Route: PUT /assignment/update/:id | Expected HTTP: 200 | Reqs: RF-24
- Test: coach cannot update another coach's assignment | Route: PUT /assignment/update/:id | Expected HTTP: 403 | Reqs: RF-24; RNF-02
- Test: admin can update any assignment | Route: PUT /assignment/update/:id | Expected HTTP: 200 | Reqs: RF-24
- Test: student cannot update assignment | Route: PUT /assignment/update/:id | Expected HTTP: 403 | Reqs: RF-24; RNF-02
- Test: returns 404 for non-existent assignment | Route: PUT /assignment/update/:id | Expected HTTP: 404 | Reqs: RF-24
- Test: unauthenticated user cannot update assignment | Route: PUT /assignment/update/:id | Expected HTTP: 401 | Reqs: RNF-02
## Delete assignment
- Test: coach can delete their own assignment | Route: DELETE /assignment/delete/:id | Expected HTTP: 200 | Reqs: RF-25
- Test: coach cannot delete another coach's assignment | Route: DELETE /assignment/delete/:id | Expected HTTP: 403 | Reqs: RF-25; RNF-02
- Test: admin can delete any assignment | Route: DELETE /assignment/delete/:id | Expected HTTP: 200 | Reqs: RF-25
- Test: student cannot delete assignment | Route: DELETE /assignment/delete/:id | Expected HTTP: 403 | Reqs: RF-25; RNF-02
- Test: returns 404 for non-existent assignment | Route: DELETE /assignment/delete/:id | Expected HTTP: 404 | Reqs: RF-25
- Test: unauthenticated user cannot delete assignment | Route: DELETE /assignment/delete/:id | Expected HTTP: 401 | Reqs: RNF-02

# Challenge API
## POST /challenge/create
- Test: student can create a challenge | Route: POST /challenge/create | Expected HTTP: 201 | Reqs: RF-36
- Test: rejects duplicate challenge for same student and cf_code | Route: POST /challenge/create | Expected HTTP: 400 | Reqs: RF-36
- Test: rejects missing cf_code | Route: POST /challenge/create | Expected HTTP: 400 | Reqs: RF-36
## POST /challenge/create/:student_id
- Test: admin can create challenge for a student | Route: POST /challenge/create/:student_id | Expected HTTP: 201 | Reqs: RF-36
- Test: admin cannot create challenge for invalid student | Route: POST /challenge/create/:student_id | Expected HTTP: 400 | Reqs: RF-36
- Test: admin cannot create challenge for non-student user | Route: POST /challenge/create/:student_id | Expected HTTP: 400 | Reqs: RF-36
## GET /challenge/get
- Test: student can get their own challenges | Route: GET /challenge/get | Expected HTTP: 200 | Reqs: RF-37
- Test: admin can get all challenges | Route: GET /challenge/get | Expected HTTP: 200 | Reqs: RF-37
- Test: admin can filter challenges by student_id | Route: GET /challenge/get | Expected HTTP: 200 | Reqs: RF-37
- Test: admin can filter challenges by cf_code | Route: GET /challenge/get | Expected HTTP: 200 | Reqs: RF-37
- Test: student cannot filter by other student's challenges | Route: GET /challenge/get | Expected HTTP: 403 | Reqs: RF-37; RNF-02
## GET /challenge/get/:id
- Test: admin can get challenge by id | Route: GET /challenge/get/:id | Expected HTTP: 200 | Reqs: RF-37
- Test: returns 404 for non-existent challenge | Route: GET /challenge/get/:id | Expected HTTP: 404 | Reqs: RF-37
## DELETE /challenge/delete/:id
- Test: student can delete their own challenge | Route: DELETE /challenge/delete/:id | Expected HTTP: 200 | Reqs: RF-39
- Test: student cannot delete other student's challenge | Route: DELETE /challenge/delete/:id | Expected HTTP: 400 | Reqs: RF-39; RNF-02
- Test: admin can delete any challenge | Route: DELETE /challenge/delete/:id | Expected HTTP: 200 | Reqs: RF-39
- Test: returns 404 for non-existent challenge | Route: DELETE /challenge/delete/:id | Expected HTTP: 404 | Reqs: RF-39
## PUT /challenge/verify/:id
- Test: student can verify their own challenge | Route: PUT /challenge/verify/:id | Expected HTTP: 200 | Reqs: RF-41; RF-42
- Test: student cannot verify other student's challenge | Route: PUT /challenge/verify/:id | Expected HTTP: 400 | Reqs: RF-41; RNF-02
- Test: admin can verify any challenge | Route: PUT /challenge/verify/:id | Expected HTTP: 200 | Reqs: RF-41
- Test: returns 404 for non-existent challenge | Route: PUT /challenge/verify/:id | Expected HTTP: 404 | Reqs: RF-41
## GET /challenge/ask
- Test: student can ask for a challenge with no filters | Route: GET /challenge/ask | Expected HTTP: 200 | Reqs: RF-36
- Test: student can ask for a challenge with min_rating | Route: GET /challenge/ask | Expected HTTP: 200 | Reqs: RF-36
- Test: student can ask for a challenge with max_rating | Route: GET /challenge/ask | Expected HTTP: 200 | Reqs: RF-36
- Test: student can ask for a challenge with min and max rating | Route: GET /challenge/ask | Expected HTTP: 200 | Reqs: RF-36
- Test: student can ask for a challenge with tags filter | Route: GET /challenge/ask | Expected HTTP: 200 | Reqs: RF-36
- Test: student can ask for a challenge with multiple tags | Route: GET /challenge/ask | Expected HTTP: 200 | Reqs: RF-36
- Test: student can ask for a challenge with all filters | Route: GET /challenge/ask | Expected HTTP: 200 | Reqs: RF-36
- Test: returns 400 when min_rating is not a number | Route: GET /challenge/ask | Expected HTTP: 400 | Reqs: RF-36
- Test: returns 400 when max_rating is not a number | Route: GET /challenge/ask | Expected HTTP: 400 | Reqs: RF-36
- Test: returns 400 when tags is not an array | Route: GET /challenge/ask | Expected HTTP: 400 | Reqs: RF-36
- Test: returns 400 when min_rating is greater than max_rating | Route: GET /challenge/ask | Expected HTTP: 400 | Reqs: RF-36
- Test: admin cannot ask for a challenge | Route: GET /challenge/ask | Expected HTTP: 403 | Reqs: RNF-02
- Test: coach cannot ask for a challenge | Route: GET /challenge/ask | Expected HTTP: 403 | Reqs: RNF-02
- Test: unauthenticated user cannot ask for a challenge | Route: GET /challenge/ask | Expected HTTP: 401 | Reqs: RNF-02
- Test: returns a cf_code in correct format | Route: GET /challenge/ask | Expected HTTP: 200 | Reqs: RF-36
- Test: returns different problems on multiple calls | Route: GET /challenge/ask | Expected HTTP: 200 | Reqs: RF-36

# CFAccount API
## GET /cfaccount/me
- Test: student can get their own cf account | Route: GET /cfaccount/me | Expected HTTP: 200 | Reqs: RF-14
- Test: coach cannot get cf account | Route: GET /cfaccount/me | Expected HTTP: 403 | Reqs: RF-14; RNF-02
## GET /cfaccount/get
- Test: admin can get cf accounts with filters | Route: GET /cfaccount/get | Expected HTTP: 200 | Reqs: RF-11
- Test: student cannot get cf accounts | Route: GET /cfaccount/get | Expected HTTP: 403 | Reqs: RF-11; RNF-02
## GET /cfaccount/get/:id
- Test: admin can get cf account by id | Route: GET /cfaccount/get/:id | Expected HTTP: 200 | Reqs: RF-11
- Test: student cannot get cf account by id | Route: GET /cfaccount/get/:id | Expected HTTP: 403 | Reqs: RF-11; RNF-02
## GET /cfaccount/start_verify
- Test: student can start verify | Route: GET /cfaccount/start_verify | Expected HTTP: 200 | Reqs: RF-15
## PUT /cfaccount/update/:id
- Test: admin can update cf account | Route: PUT /cfaccount/update/:id | Expected HTTP: 200 | Reqs: RF-12; RF-14
- Test: student can update their own cf account | Route: PUT /cfaccount/update/:id | Expected HTTP: 200 | Reqs: RF-12; RF-14

# Direct Messages API
## POST /direct-messages/send/:user_id
- Test: sends a direct message successfully | Route: POST /direct-messages/send/:user_id | Expected HTTP: 201 | Reqs: RF-47; RF-48
- Test: rejects sending message to yourself | Route: POST /direct-messages/send/:user_id | Expected HTTP: 400 | Reqs: RF-47; RF-48
- Test: rejects invalid receiver_id | Route: POST /direct-messages/send/:user_id | Expected HTTP: 400 | Reqs: RF-47; RF-48
- Test: rejects message from blocked sender | Route: POST /direct-messages/send/:user_id | Expected HTTP: 403 | Reqs: RF-47; RF-48; RNF-02
- Test: rejects missing message field | Route: POST /direct-messages/send/:user_id | Expected HTTP: >=400 | Reqs: RF-47; RF-48
## GET /direct-messages/conversation/
- Test: retrieves conversation partners for a user | Route: GET /direct-messages/conversation/ | Expected HTTP: 200 | Reqs: RF-47; RF-48
- Test: returns empty array when user has no conversations | Route: GET /direct-messages/conversation/ | Expected HTTP: 200 | Reqs: RF-47; RF-48
## GET /direct-messages/conversation/:user_id
- Test: retrieves conversation between two users | Route: GET /direct-messages/conversation/:user_id | Expected HTTP: 200 | Reqs: RF-47; RF-48
- Test: returns empty array for non-existent conversation | Route: GET /direct-messages/conversation/:user_id | Expected HTTP: 200 | Reqs: RF-47; RF-48
- Test: rejects invalid user_id | Route: GET /direct-messages/conversation/:user_id | Expected HTTP: 400 | Reqs: RF-47; RF-48
## POST /direct-messages/block/:user_id
- Test: blocks a user successfully | Route: POST /direct-messages/block/:user_id | Expected HTTP: 201 | Reqs: RF-47; RF-48
- Test: rejects blocking yourself | Route: POST /direct-messages/block/:user_id | Expected HTTP: 400 | Reqs: RF-47; RF-48
- Test: rejects blocking already blocked user | Route: POST /direct-messages/block/:user_id | Expected HTTP: 400 | Reqs: RF-47; RF-48
- Test: rejects invalid user_id | Route: POST /direct-messages/block/:user_id | Expected HTTP: 400 | Reqs: RF-47; RF-48
## DELETE /direct-messages/unblock/:user_id
- Test: unblocks a user successfully | Route: DELETE /direct-messages/unblock/:user_id | Expected HTTP: 200 | Reqs: RF-47; RF-48
- Test: rejects unblocking non-blocked user | Route: DELETE /direct-messages/unblock/:user_id | Expected HTTP: 404 | Reqs: RF-47; RF-48
- Test: rejects invalid user_id | Route: DELETE /direct-messages/unblock/:user_id | Expected HTTP: 400 | Reqs: RF-47; RF-48
## GET /direct-messages/blocked
- Test: retrieves list of blocked users | Route: GET /direct-messages/blocked | Expected HTTP: 200 | Reqs: RF-47; RF-48
- Test: returns empty array when user has no blocked users | Route: GET /direct-messages/blocked | Expected HTTP: 200 | Reqs: RF-47; RF-48

# Exercise API
## Create exercise
- Test: coach can create a new exercise for their assignment | Route: POST /exercise/create | Expected HTTP: 201 | Reqs: RF-26
- Test: coach cannot create exercise for another coach's assignment | Route: POST /exercise/create | Expected HTTP: 403 | Reqs: RF-26; RNF-02
- Test: admin can create a new exercise for any assignment | Route: POST /exercise/create | Expected HTTP: 201 | Reqs: RF-26
- Test: student cannot create an exercise | Route: POST /exercise/create | Expected HTTP: 403 | Reqs: RF-26; RNF-02
- Test: returns 400 for missing name | Route: POST /exercise/create | Expected HTTP: 400 | Reqs: RF-26
- Test: returns 400 for missing cf_code | Route: POST /exercise/create | Expected HTTP: 400 | Reqs: RF-26
- Test: returns 400 for missing parent_assignment | Route: POST /exercise/create | Expected HTTP: 400 | Reqs: RF-26
- Test: returns 400 for invalid parent_assignment | Route: POST /exercise/create | Expected HTTP: 400 | Reqs: RF-26
- Test: unauthenticated user cannot create exercise | Route: POST /exercise/create | Expected HTTP: 401 | Reqs: RNF-02
## Get exercises
- Test: coach can get their own exercises | Route: GET /exercise/get | Expected HTTP: 200 | Reqs: RF-27
- Test: coach cannot get another coach's exercises | Route: GET /exercise/get | Expected HTTP: 200 | Reqs: RF-27
- Test: student can get exercises for assignments in groups they belong to | Route: GET /exercise/get | Expected HTTP: 200 | Reqs: RF-27
- Test: admin can get all exercises | Route: GET /exercise/get | Expected HTTP: 200 | Reqs: RF-27
- Test: unauthenticated user cannot get exercises | Route: GET /exercise/get | Expected HTTP: 401 | Reqs: RNF-02
## Get exercise by id
- Test: coach can get their own exercise by id | Route: GET /exercise/get/:id | Expected HTTP: 200 | Reqs: RF-27
- Test: coach cannot get another coach's exercise | Route: GET /exercise/get/:id | Expected HTTP: 403 | Reqs: RF-27; RNF-02
- Test: student can get exercise for assignment in group they belong to | Route: GET /exercise/get/:id | Expected HTTP: 200 | Reqs: RF-27
- Test: student cannot get exercise for assignment in group they don't belong to | Route: GET /exercise/get/:id | Expected HTTP: 403 | Reqs: RF-27; RNF-02
- Test: admin can get any exercise by id | Route: GET /exercise/get/:id | Expected HTTP: 200 | Reqs: RF-27
- Test: returns 404 for non-existent exercise | Route: GET /exercise/get/:id | Expected HTTP: 404 | Reqs: RF-27
- Test: unauthenticated user cannot get exercise | Route: GET /exercise/get/:id | Expected HTTP: 401 | Reqs: RNF-02
## Update exercise
- Test: coach can update their own exercise | Route: PUT /exercise/update/:id | Expected HTTP: 200 | Reqs: RF-28
- Test: coach cannot update another coach's exercise | Route: PUT /exercise/update/:id | Expected HTTP: 403 | Reqs: RF-28; RNF-02
- Test: admin can update any exercise | Route: PUT /exercise/update/:id | Expected HTTP: 200 | Reqs: RF-28
- Test: student cannot update exercise | Route: PUT /exercise/update/:id | Expected HTTP: 403 | Reqs: RF-28; RNF-02
- Test: returns 404 for non-existent exercise | Route: PUT /exercise/update/:id | Expected HTTP: 404 | Reqs: RF-28
- Test: unauthenticated user cannot update exercise | Route: PUT /exercise/update/:id | Expected HTTP: 401 | Reqs: RNF-02
## Delete exercise
- Test: coach can delete their own exercise | Route: DELETE /exercise/delete/:id | Expected HTTP: 200 | Reqs: RF-29
- Test: coach cannot delete another coach's exercise | Route: DELETE /exercise/delete/:id | Expected HTTP: 403 | Reqs: RF-29; RNF-02
- Test: admin can delete any exercise | Route: DELETE /exercise/delete/:id | Expected HTTP: 200 | Reqs: RF-29
- Test: student cannot delete exercise | Route: DELETE /exercise/delete/:id | Expected HTTP: 403 | Reqs: RF-29; RNF-02
- Test: returns 404 for non-existent exercise | Route: DELETE /exercise/delete/:id | Expected HTTP: 404 | Reqs: RF-29
- Test: unauthenticated user cannot delete exercise | Route: DELETE /exercise/delete/:id | Expected HTTP: 401 | Reqs: RNF-02

# Following API
## POST /following/create
- Test: creates a following as a student | Route: POST /following/create | Expected HTTP: 201 | Reqs: RF-4; RF-47
- Test: creates a following as admin | Route: POST /following/create | Expected HTTP: 201 | Reqs: RF-4; RF-47
- Test: rejects creating following self | Route: POST /following/create | Expected HTTP: 400 | Reqs: RF-4; RF-47
- Test: rejects invalid student_1_id | Route: POST /following/create | Expected HTTP: 400 | Reqs: RF-4; RF-47
- Test: rejects invalid student_2_id | Route: POST /following/create | Expected HTTP: 400 | Reqs: RF-4; RF-47
- Test: rejects student creating for another user | Route: POST /following/create | Expected HTTP: 400 | Reqs: RF-4; RF-47
## GET /following/get
- Test: gets all followings as admin | Route: GET /following/get | Expected HTTP: 200 | Reqs: RF-4; RF-47
- Test: gets own followings as student | Route: GET /following/get | Expected HTTP: 200 | Reqs: RF-4; RF-47
- Test: filters by student_1_id | Route: GET /following/get | Expected HTTP: 200 | Reqs: RF-4; RF-47
- Test: filters by student_2_id | Route: GET /following/get | Expected HTTP: 200 | Reqs: RF-4; RF-47
## GET /following/get/:id
- Test: gets following by id as admin | Route: GET /following/get/:id | Expected HTTP: 200 | Reqs: RF-4; RF-47
- Test: returns 404 for non-existent following | Route: GET /following/get/:id | Expected HTTP: 404 | Reqs: RF-4; RF-47
## DELETE /following/delete/:id
- Test: deletes following as student (own) | Route: DELETE /following/delete/:id | Expected HTTP: 200 | Reqs: RF-4; RF-47
- Test: deletes following as admin | Route: DELETE /following/delete/:id | Expected HTTP: 200 | Reqs: RF-4; RF-47
- Test: rejects deleting others' following as student | Route: DELETE /following/delete/:id | Expected HTTP: 403 | Reqs: RF-4; RF-47; RNF-02
- Test: returns 404 for non-existent following | Route: DELETE /following/delete/:id | Expected HTTP: 404 | Reqs: RF-4; RF-47
## GET /following/count/:user_id
- Test: gets follower count | Route: GET /following/count/:user_id | Expected HTTP: 200 | Reqs: RF-4; RF-47
## GET /following
- Test: student can get their followings list | Route: GET /following | Expected HTTP: 200 | Reqs: RF-4; RF-47
- Test: student with no followings returns empty list | Route: GET /following | Expected HTTP: 200 | Reqs: RF-4; RF-47
- Test: admin cannot access this endpoint | Route: GET /following | Expected HTTP: 403 | Reqs: RF-4; RF-47; RNF-02
- Test: unauthenticated user cannot access | Route: GET /following | Expected HTTP: 401 | Reqs: RF-4; RF-47; RNF-02

# Group API
## Create group
- Test: coach can create a new group | Route: POST /group/create | Expected HTTP: 201 | Reqs: RF-16
- Test: admin can create a new group with parent_coach | Route: POST /group/create | Expected HTTP: 201 | Reqs: RF-16
- Test: admin cannot create group without parent_coach | Route: POST /group/create | Expected HTTP: 400 | Reqs: RF-16
- Test: student cannot create a group | Route: POST /group/create | Expected HTTP: 403 | Reqs: RF-16; RNF-02
- Test: unauthenticated user cannot create group | Route: POST /group/create | Expected HTTP: 401 | Reqs: RNF-02
## Get groups
- Test: coach can get their own groups | Route: GET /group/get | Expected HTTP: 200 | Reqs: RF-17
- Test: admin can get all groups | Route: GET /group/get | Expected HTTP: 200 | Reqs: RF-17
- Test: student cannot get groups | Route: GET /group/get | Expected HTTP: 403 | Reqs: RF-17; RNF-02
## Get group by id
- Test: coach can get their own group by id | Route: GET /group/get/:id | Expected HTTP: 200 | Reqs: RF-17
- Test: coach cannot get another coach's group | Route: GET /group/get/:id | Expected HTTP: 403 | Reqs: RF-17; RNF-02
- Test: student can get group they belong to | Route: GET /group/get/:id | Expected HTTP: 200 | Reqs: RF-17
- Test: student cannot get group they don't belong to | Route: GET /group/get/:id | Expected HTTP: 403 | Reqs: RF-17; RNF-02
- Test: admin can get any group by id | Route: GET /group/get/:id | Expected HTTP: 200 | Reqs: RF-17
- Test: returns 404 for non-existent group | Route: GET /group/get/:id | Expected HTTP: 404 | Reqs: RF-17
## Update group
- Test: coach can update their own group | Route: PUT /group/update/:id | Expected HTTP: 200 | Reqs: RF-18
- Test: coach cannot update another coach's group | Route: PUT /group/update/:id | Expected HTTP: 403 | Reqs: RF-18; RNF-02
- Test: admin can update any group | Route: PUT /group/update/:id | Expected HTTP: 200 | Reqs: RF-18
- Test: student cannot update group | Route: PUT /group/update/:id | Expected HTTP: 403 | Reqs: RF-18; RNF-02
- Test: returns 404 for non-existent group | Route: PUT /group/update/:id | Expected HTTP: 404 | Reqs: RF-18
## Delete group
- Test: coach can delete their own group | Route: DELETE /group/delete/:id | Expected HTTP: 200 | Reqs: RF-19
- Test: coach cannot delete another coach's group | Route: DELETE /group/delete/:id | Expected HTTP: 403 | Reqs: RF-19; RNF-02
- Test: admin can delete any group | Route: DELETE /group/delete/:id | Expected HTTP: 200 | Reqs: RF-19
- Test: student cannot delete group | Route: DELETE /group/delete/:id | Expected HTTP: 403 | Reqs: RF-19; RNF-02
- Test: returns 404 for non-existent group | Route: DELETE /group/delete/:id | Expected HTTP: 404 | Reqs: RF-19
## Create group invite code
- Test: coach can create invite code for their own group | Route: POST /group/create-invite-code/:group_id | Expected HTTP: 201 | Reqs: RF-20; RF-21
- Test: admin can create invite code for any group | Route: POST /group/create-invite-code/:group_id | Expected HTTP: 201 | Reqs: RF-20; RF-21
- Test: coach cannot create invite code for another coach's group | Route: POST /group/create-invite-code/:group_id | Expected HTTP: 403 | Reqs: RF-20; RF-21; RNF-02
- Test: returns 404 for non-existent group | Route: POST /group/create-invite-code/:group_id | Expected HTTP: 404 | Reqs: RF-20; RF-21
- Test: student cannot create invite code | Route: POST /group/create-invite-code/:group_id | Expected HTTP: 403 | Reqs: RF-20; RF-21; RNF-02
- Test: unauthenticated user cannot create invite code | Route: POST /group/create-invite-code/:group_id | Expected HTTP: 401 | Reqs: RNF-02
## Get group invite code
- Test: coach can get invite code for their own group | Route: GET /group/get-invite-code/:group_id | Expected HTTP: 200 | Reqs: RF-20; RF-21
- Test: admin can get invite code for any group | Route: GET /group/get-invite-code/:group_id | Expected HTTP: 200 | Reqs: RF-20; RF-21
- Test: coach cannot get invite code for another coach's group | Route: GET /group/get-invite-code/:group_id | Expected HTTP: 403 | Reqs: RF-20; RF-21; RNF-02
- Test: returns 404 when group has no invite code | Route: GET /group/get-invite-code/:group_id | Expected HTTP: 404 | Reqs: RF-20; RF-21
- Test: returns 404 for non-existent group | Route: GET /group/get-invite-code/:group_id | Expected HTTP: 404 | Reqs: RF-20; RF-21
- Test: student cannot get invite code | Route: GET /group/get-invite-code/:group_id | Expected HTTP: 403 | Reqs: RF-20; RF-21; RNF-02
- Test: unauthenticated user cannot get invite code | Route: GET /group/get-invite-code/:group_id | Expected HTTP: 401 | Reqs: RNF-02
## Delete group invite code
- Test: coach can delete invite code for their own group | Route: DELETE /group/delete-invite-code/:group_id | Expected HTTP: 200 | Reqs: RF-20; RF-21
- Test: admin can delete invite code for any group | Route: DELETE /group/delete-invite-code/:group_id | Expected HTTP: 200 | Reqs: RF-20; RF-21
- Test: coach cannot delete invite code for another coach's group | Route: DELETE /group/delete-invite-code/:group_id | Expected HTTP: 403 | Reqs: RF-20; RF-21; RNF-02
- Test: returns 400 when group has no invite code to delete | Route: DELETE /group/delete-invite-code/:group_id | Expected HTTP: 400 | Reqs: RF-20; RF-21
- Test: returns 404 for non-existent group | Route: DELETE /group/delete-invite-code/:group_id | Expected HTTP: 404 | Reqs: RF-20; RF-21
- Test: student cannot delete invite code | Route: DELETE /group/delete-invite-code/:group_id | Expected HTTP: 403 | Reqs: RF-20; RF-21; RNF-02
- Test: unauthenticated user cannot delete invite code | Route: DELETE /group/delete-invite-code/:group_id | Expected HTTP: 401 | Reqs: RNF-02
## Get group messages
- Test: coach can get messages from their own group | Route: GET /group/get-messages/:group_id | Expected HTTP: 200 | Reqs: RF-44
- Test: student can get messages from their group | Route: GET /group/get-messages/:group_id | Expected HTTP: 200 | Reqs: RF-44
- Test: student cannot get messages from group they don't belong to | Route: GET /group/get-messages/:group_id | Expected HTTP: 403 | Reqs: RF-44; RNF-02
- Test: coach cannot get messages from another coach's group | Route: GET /group/get-messages/:group_id | Expected HTTP: 403 | Reqs: RF-44; RNF-02
- Test: admin can get messages from any group | Route: GET /group/get-messages/:group_id | Expected HTTP: 200 | Reqs: RF-44
- Test: returns 404 for non-existent group | Route: GET /group/get-messages/:group_id | Expected HTTP: 404 | Reqs: RF-44
- Test: unauthenticated user cannot get messages | Route: GET /group/get-messages/:group_id | Expected HTTP: 401 | Reqs: RNF-02
## Send group message
- Test: coach can send message to their own group | Route: POST /group/send-message/:group_id | Expected HTTP: 201 | Reqs: RF-45
- Test: student can send message to their group | Route: POST /group/send-message/:group_id | Expected HTTP: 201 | Reqs: RF-45
- Test: student cannot send message to group they don't belong to | Route: POST /group/send-message/:group_id | Expected HTTP: 403 | Reqs: RF-45; RNF-02
- Test: coach cannot send message to another coach's group | Route: POST /group/send-message/:group_id | Expected HTTP: 403 | Reqs: RF-45; RNF-02
- Test: admin can send message to any group | Route: POST /group/send-message/:group_id | Expected HTTP: 201 | Reqs: RF-45
- Test: returns 400 when message is empty | Route: POST /group/send-message/:group_id | Expected HTTP: 400 | Reqs: RF-45
- Test: returns 400 when message text is missing | Route: POST /group/send-message/:group_id | Expected HTTP: 400 | Reqs: RF-45
- Test: returns 400 when message exceeds 1000 characters | Route: POST /group/send-message/:group_id | Expected HTTP: 400 | Reqs: RF-45
- Test: message is stored in group and can be retrieved | Route: POST /group/send-message/:group_id | Expected HTTP: 201 | Reqs: RF-45
- Test: returns 404 for non-existent group | Route: POST /group/send-message/:group_id | Expected HTTP: 404 | Reqs: RF-45
- Test: message timestamp is set correctly | Route: POST /group/send-message/:group_id | Expected HTTP: 201 | Reqs: RF-45
- Test: unauthenticated user cannot send message | Route: POST /group/send-message/:group_id | Expected HTTP: 401 | Reqs: RNF-02
## Get my groups summary
- Test: admin cannot get groups summary (access denied) | Route: GET /group/my-groups-summary | Expected HTTP: 403 | Reqs: RF-17; RNF-02
- Test: unauthenticated user cannot get groups summary | Route: GET /group/my-groups-summary | Expected HTTP: 401 | Reqs: RF-17; RNF-02
- Test: student with no groups returns empty array | Route: GET /group/my-groups-summary | Expected HTTP: 200 | Reqs: RF-17
- Test: coach with no groups returns empty array | Route: GET /group/my-groups-summary | Expected HTTP: 200 | Reqs: RF-17
- Test: student with a group gets one group | Route: GET /group/my-groups-summary | Expected HTTP: 200 | Reqs: RF-17
## Get group details
- Test: coach can get details of their own group | Route: GET /group/details/:group_id | Expected HTTP: 200 | Reqs: RF-17
- Test: student can get details of their group | Route: GET /group/details/:group_id | Expected HTTP: 200 | Reqs: RF-17
- Test: student cannot get details of group they don't belong to | Route: GET /group/details/:group_id | Expected HTTP: 403 | Reqs: RF-17; RNF-02
- Test: coach cannot get details of another coach's group | Route: GET /group/details/:group_id | Expected HTTP: 403 | Reqs: RF-17; RNF-02
- Test: admin can get details of any group | Route: GET /group/details/:group_id | Expected HTTP: 200 | Reqs: RF-17
- Test: returns 404 for non-existent group | Route: GET /group/details/:group_id | Expected HTTP: 404 | Reqs: RF-17
- Test: returns 404 for invalid group id format | Route: GET /group/details/:group_id | Expected HTTP: 404 | Reqs: RF-17
- Test: group details includes owner information | Route: GET /group/details/:group_id | Expected HTTP: 200 | Reqs: RF-17
- Test: group details includes assignments with exercise count | Route: GET /group/details/:group_id | Expected HTTP: 200 | Reqs: RF-17; RF-50
- Test: unauthenticated user cannot get group details | Route: GET /group/details/:group_id | Expected HTTP: 401 | Reqs: RNF-02

# Health
## General
- Test: returns ok | Route: GET /health | Expected HTTP: 200 | Reqs: N/A

# Stats API
## GET /stats/get-student-stats/:studentId
- Test: should return 404 when student ID is invalid | Route: GET /stats/get-student-stats/:studentId | Expected HTTP: 404 | Reqs: RF-5; RF-51
- Test: should return 404 when student does not exist | Route: GET /stats/get-student-stats/:studentId | Expected HTTP: 404 | Reqs: RF-5; RF-51
- Test: should return 400 when user is not a student | Route: GET /stats/get-student-stats/:studentId | Expected HTTP: 400 | Reqs: RF-5; RF-51
- Test: should return 400 when student does not have a Codeforces account linked | Route: GET /stats/get-student-stats/:studentId | Expected HTTP: 400 | Reqs: RF-5; RF-14; RF-51
- Test: should return student stats successfully | Route: GET /stats/get-student-stats/:studentId | Expected HTTP: 200 | Reqs: RF-5; RF-49; RF-50; RF-51
- Test: should handle errors gracefully when CF account not found | Route: GET /stats/get-student-stats/:studentId | Expected HTTP: 400 | Reqs: RF-5; RF-14; RF-51
- Test: should return proper metadata with current timestamp | Route: GET /stats/get-student-stats/:studentId | Expected HTTP: 200 | Reqs: RF-5; RF-51

# StudentExercise API
## Create student exercise
- Test: student can create student exercise for themselves | Route: POST /student-exercise/create | Expected HTTP: 201 | Reqs: RF-33
- Test: student cannot create student exercise for another student | Route: POST /student-exercise/create | Expected HTTP: 403 | Reqs: RF-33; RNF-02
- Test: admin can create student exercise for any student | Route: POST /student-exercise/create/:student_id | Expected HTTP: 201 | Reqs: RF-33
- Test: admin cannot create student exercise for invalid student | Route: POST /student-exercise/create/:student_id | Expected HTTP: 400 | Reqs: RF-33
- Test: admin cannot create student exercise for non-student user | Route: POST /student-exercise/create/:student_id | Expected HTTP: 400 | Reqs: RF-33
- Test: returns 400 for invalid exercise_id | Route: POST /student-exercise/create | Expected HTTP: 400 | Reqs: RF-33
- Test: returns 400 for missing exercise_id | Route: POST /student-exercise/create | Expected HTTP: 400 | Reqs: RF-33
- Test: coach cannot create student exercise | Route: POST /student-exercise/create | Expected HTTP: 403 | Reqs: RF-33; RNF-02
- Test: unauthenticated user cannot create student exercise | Route: POST /student-exercise/create | Expected HTTP: 401 | Reqs: RNF-02
## Get student exercises
- Test: student can get their own student exercises | Route: GET /student-exercise/get | Expected HTTP: 200 | Reqs: RF-34
- Test: student cannot get another student exercises | Route: GET /student-exercise/get | Expected HTTP: 403 | Reqs: RF-34; RNF-02
- Test: coach can get student exercises for their groups | Route: GET /student-exercise/get | Expected HTTP: 200 | Reqs: RF-34
- Test: coach cannot get student exercises for another coach groups | Route: GET /student-exercise/get | Expected HTTP: 403 | Reqs: RF-34; RNF-02
- Test: admin can get all student exercises | Route: GET /student-exercise/get | Expected HTTP: 200 | Reqs: RF-34
- Test: can filter by exercise_id | Route: GET /student-exercise/get | Expected HTTP: 200 | Reqs: RF-34
- Test: can filter by assignment_id | Route: GET /student-exercise/get | Expected HTTP: 200 | Reqs: RF-34
- Test: can filter by group_id | Route: GET /student-exercise/get | Expected HTTP: 200 | Reqs: RF-34
- Test: returns 400 when querying more than one filter | Route: GET /student-exercise/get | Expected HTTP: 400 | Reqs: RF-34
- Test: unauthenticated user cannot get student exercises | Route: GET /student-exercise/get | Expected HTTP: 401 | Reqs: RNF-02
## Get student exercise by id
- Test: admin can get student exercise by id | Route: GET /student-exercise/get/:id | Expected HTTP: 200 | Reqs: RF-34
- Test: returns 404 for non-existent student exercise | Route: GET /student-exercise/get/:id | Expected HTTP: 404 | Reqs: RF-34
- Test: coach cannot get student exercise by id | Route: GET /student-exercise/get/:id | Expected HTTP: 403 | Reqs: RF-34; RNF-02
- Test: student cannot get student exercise by id | Route: GET /student-exercise/get/:id | Expected HTTP: 403 | Reqs: RF-34; RNF-02
- Test: unauthenticated user cannot get student exercise by id | Route: GET /student-exercise/get/:id | Expected HTTP: 401 | Reqs: RNF-02
## Delete student exercise
- Test: admin can delete student exercise | Route: DELETE /student-exercise/delete/:id | Expected HTTP: 200 | Reqs: RF-35
- Test: returns 404 for non-existent student exercise | Route: DELETE /student-exercise/delete/:id | Expected HTTP: 404 | Reqs: RF-35
- Test: coach cannot delete student exercise | Route: DELETE /student-exercise/delete/:id | Expected HTTP: 403 | Reqs: RF-35; RNF-02
- Test: student cannot delete student exercise | Route: DELETE /student-exercise/delete/:id | Expected HTTP: 403 | Reqs: RF-35; RNF-02
- Test: unauthenticated user cannot delete student exercise | Route: DELETE /student-exercise/delete/:id | Expected HTTP: 401 | Reqs: RNF-02

# StudentGroup API
## Add member by username
- Test: coach can add member by username to their own group | Route: POST /student-group/add-member | Expected HTTP: 201 | Reqs: RF-30
- Test: coach cannot add member by username to another coach group | Route: POST /student-group/add-member | Expected HTTP: 403 | Reqs: RF-30; RNF-02
- Test: admin can add member by username to any group | Route: POST /student-group/add-member | Expected HTTP: 201 | Reqs: RF-30
- Test: returns 400 for invalid student_username | Route: POST /student-group/add-member | Expected HTTP: 400 | Reqs: RF-30
- Test: returns 400 when student_username is missing | Route: POST /student-group/add-member | Expected HTTP: 400 | Reqs: RF-30
- Test: returns 400 for invalid group_id | Route: POST /student-group/add-member | Expected HTTP: 400 | Reqs: RF-30
- Test: returns 400 for non-student user | Route: POST /student-group/add-member | Expected HTTP: 400 | Reqs: RF-30
- Test: returns 400 for non-existent group | Route: POST /student-group/add-member | Expected HTTP: 400 | Reqs: RF-30
- Test: student cannot add member by username | Route: POST /student-group/add-member | Expected HTTP: 403 | Reqs: RF-30; RNF-02
- Test: unauthenticated user cannot add member by username | Route: POST /student-group/add-member | Expected HTTP: 401 | Reqs: RNF-02
## Create student group
- Test: coach can create student group for their own group | Route: POST /student-group/create | Expected HTTP: 201 | Reqs: RF-30
- Test: coach cannot create student group for another coach group | Route: POST /student-group/create | Expected HTTP: 403 | Reqs: RF-30; RNF-02
- Test: admin can create student group for any group | Route: POST /student-group/create | Expected HTTP: 201 | Reqs: RF-30
- Test: returns 400 for invalid student_id | Route: POST /student-group/create | Expected HTTP: 400 | Reqs: RF-30
- Test: returns 400 for invalid group_id | Route: POST /student-group/create | Expected HTTP: 400 | Reqs: RF-30
- Test: returns 400 for non-student user | Route: POST /student-group/create | Expected HTTP: 400 | Reqs: RF-30
- Test: returns 400 for non-existent group | Route: POST /student-group/create | Expected HTTP: 400 | Reqs: RF-30
- Test: student cannot create student group | Route: POST /student-group/create | Expected HTTP: 403 | Reqs: RF-30; RNF-02
- Test: unauthenticated user cannot create student group | Route: POST /student-group/create | Expected HTTP: 401 | Reqs: RNF-02
## Get student groups
- Test: student can get their own student groups | Route: GET /student-group/get | Expected HTTP: 200 | Reqs: RF-31
- Test: student cannot specify student_id | Route: GET /student-group/get | Expected HTTP: 403 | Reqs: RF-31; RNF-02
- Test: coach can get student groups for their groups | Route: GET /student-group/get | Expected HTTP: 200 | Reqs: RF-31
- Test: coach can filter by their own group_id | Route: GET /student-group/get | Expected HTTP: 200 | Reqs: RF-31
- Test: coach cannot get student groups for another coach groups | Route: GET /student-group/get | Expected HTTP: 403 | Reqs: RF-31; RNF-02
- Test: admin can get all student groups | Route: GET /student-group/get | Expected HTTP: 200 | Reqs: RF-31
- Test: admin can filter by student_id | Route: GET /student-group/get | Expected HTTP: 200 | Reqs: RF-31
- Test: admin can filter by group_id | Route: GET /student-group/get | Expected HTTP: 200 | Reqs: RF-31
- Test: unauthenticated user cannot get student groups | Route: GET /student-group/get | Expected HTTP: 401 | Reqs: RNF-02
## Get student groups with username
- Test: student can get their own student groups with username | Route: GET /student-group/get-with-username | Expected HTTP: 200 | Reqs: RF-31
- Test: student cannot specify student_id | Route: GET /student-group/get-with-username | Expected HTTP: 403 | Reqs: RF-31; RNF-02
- Test: coach can get student groups for their groups with username | Route: GET /student-group/get-with-username | Expected HTTP: 200 | Reqs: RF-31
- Test: coach can filter by their own group_id | Route: GET /student-group/get-with-username | Expected HTTP: 200 | Reqs: RF-31
- Test: coach cannot get student groups for another coach groups | Route: GET /student-group/get-with-username | Expected HTTP: 403 | Reqs: RF-31; RNF-02
- Test: admin can get all student groups with username | Route: GET /student-group/get-with-username | Expected HTTP: 200 | Reqs: RF-31
- Test: admin can filter by student_id | Route: GET /student-group/get-with-username | Expected HTTP: 200 | Reqs: RF-31
- Test: admin can filter by group_id | Route: GET /student-group/get-with-username | Expected HTTP: 200 | Reqs: RF-31
- Test: unauthenticated user cannot get student groups with username | Route: GET /student-group/get-with-username | Expected HTTP: 401 | Reqs: RNF-02
## Get student group by id
- Test: admin can get student group by id | Route: GET /student-group/get/:id | Expected HTTP: 200 | Reqs: RF-31
- Test: returns 404 for non-existent student group | Route: GET /student-group/get/:id | Expected HTTP: 404 | Reqs: RF-31
- Test: coach cannot get student group by id | Route: GET /student-group/get/:id | Expected HTTP: 403 | Reqs: RF-31; RNF-02
- Test: student cannot get student group by id | Route: GET /student-group/get/:id | Expected HTTP: 403 | Reqs: RF-31; RNF-02
- Test: unauthenticated user cannot get student group by id | Route: GET /student-group/get/:id | Expected HTTP: 401 | Reqs: RNF-02
## Delete student group
- Test: coach can delete student group from their own group | Route: DELETE /student-group/delete/:id | Expected HTTP: 200 | Reqs: RF-32
- Test: coach cannot delete student group from another coach group | Route: DELETE /student-group/delete/:id | Expected HTTP: 403 | Reqs: RF-32; RNF-02
- Test: admin can delete any student group | Route: DELETE /student-group/delete/:id | Expected HTTP: 200 | Reqs: RF-32
- Test: returns 404 for non-existent student group | Route: DELETE /student-group/delete/:id | Expected HTTP: 404 | Reqs: RF-32
- Test: student cannot delete student group | Route: DELETE /student-group/delete/:id | Expected HTTP: 403 | Reqs: RF-32; RNF-02
- Test: unauthenticated user cannot delete student group | Route: DELETE /student-group/delete/:id | Expected HTTP: 401 | Reqs: RNF-02
## Use group invite code
- Test: student can join group with valid invite code | Route: POST /student-group/use-invite-code | Expected HTTP: 201 | Reqs: RF-20; RF-30
- Test: student cannot join group with invalid invite code | Route: POST /student-group/use-invite-code | Expected HTTP: 404 | Reqs: RF-20; RF-30
- Test: returns 400 when invite code is missing | Route: POST /student-group/use-invite-code | Expected HTTP: 400 | Reqs: RF-20; RF-30
- Test: returns 400 when invite code is empty string | Route: POST /student-group/use-invite-code | Expected HTTP: 400 | Reqs: RF-20; RF-30
- Test: student cannot join same group twice with invite code | Route: POST /student-group/use-invite-code | Expected HTTP: 400 | Reqs: RF-20; RF-30
- Test: multiple students can join group with same invite code | Route: POST /student-group/use-invite-code | Expected HTTP: 201 | Reqs: RF-20; RF-30
- Test: unauthenticated user cannot use invite code | Route: POST /student-group/use-invite-code | Expected HTTP: 401 | Reqs: RNF-02
- Test: coach cannot use invite code to join group | Route: POST /student-group/use-invite-code | Expected HTTP: 403 | Reqs: RF-20; RF-30; RNF-02
- Test: admin cannot use invite code to join group | Route: POST /student-group/use-invite-code | Expected HTTP: 403 | Reqs: RF-20; RF-30; RNF-02
- Test: student can still use invite code after other student joins | Route: POST /student-group/use-invite-code | Expected HTTP: 201 | Reqs: RF-20; RF-30
- Test: deleted invite code cannot be used | Route: POST /student-group/use-invite-code | Expected HTTP: 404 | Reqs: RF-20; RF-30
- Test: student is added to correct group when using invite code | Route: POST /student-group/use-invite-code | Expected HTTP: 201 | Reqs: RF-20; RF-30

# Codeforces Service
## verifyProblemSolved
- Test: should return solved=true with completionType for most problems in test mode | Route: service codeforces.verifyProblemSolved | Expected HTTP: N/A | Reqs: RF-40; RF-41; RF-42
- Test: should return solved=true with completionType='normal' for non-A problems | Route: service codeforces.verifyProblemSolved | Expected HTTP: N/A | Reqs: RF-40; RF-41; RF-42
- Test: should return solved=false with completionType=null for problem 999Z | Route: service codeforces.verifyProblemSolved | Expected HTTP: N/A | Reqs: RF-40; RF-41
## verifyProblemCompilationErrorRecent
- Test: should return true for most problems in test mode | Route: service codeforces.verifyProblemCompilationErrorRecent | Expected HTTP: N/A | Reqs: RF-40; RF-41
- Test: should return false for problem 888Z in test mode | Route: service codeforces.verifyProblemCompilationErrorRecent | Expected HTTP: N/A | Reqs: RF-40; RF-41
## validateCfCode
- Test: should return true for valid cf_codes in test mode | Route: service codeforces.validateCfCode | Expected HTTP: N/A | Reqs: RF-15
- Test: should return true for cf_codes with problem iteration | Route: service codeforces.validateCfCode | Expected HTTP: N/A | Reqs: RF-15
- Test: should return false for invalid cf_code 999Z in test mode | Route: service codeforces.validateCfCode | Expected HTTP: N/A | Reqs: RF-15
- Test: should return false for invalid format | Route: service codeforces.validateCfCode | Expected HTTP: N/A | Reqs: RF-15
- Test: should return false for code without contest ID | Route: service codeforces.validateCfCode | Expected HTTP: N/A | Reqs: RF-15
## verifyExistingCodeforcesAccount
- Test: should return true for most handles in test mode | Route: service codeforces.verifyExistingCodeforcesAccount | Expected HTTP: N/A | Reqs: RF-14; RF-15
- Test: should return true for testuser | Route: service codeforces.verifyExistingCodeforcesAccount | Expected HTTP: N/A | Reqs: RF-14; RF-15
- Test: should return false for nonexistent handle in test mode | Route: service codeforces.verifyExistingCodeforcesAccount | Expected HTTP: N/A | Reqs: RF-14; RF-15
## getProblemInfo
- Test: should return problem info for valid code in test mode | Route: service codeforces.getProblemInfo | Expected HTTP: N/A | Reqs: RF-15
- Test: should return non-existent for 999Z in test mode | Route: service codeforces.getProblemInfo | Expected HTTP: N/A | Reqs: RF-15
## getUserInfo
- Test: should return user info in test mode | Route: service codeforces.getUserInfo | Expected HTTP: N/A | Reqs: RF-5
## getRandomValidProblem
- Test: should return a problem object in test mode | Route: service codeforces.getRandomValidProblem | Expected HTTP: N/A | Reqs: RF-36
## getUserSubmissions
- Test: should return submissions array in test mode | Route: service codeforces.getUserSubmissions | Expected HTTP: N/A | Reqs: RF-5; RF-40; RF-41
## cf_code format validation
- Test: should accept valid formats like 123A, 1234B2 | Route: service codeforces.getProblemInfo | Expected HTTP: N/A | Reqs: RF-15
- Test: should throw error for invalid formats | Route: service codeforces.getProblemInfo | Expected HTTP: N/A | Reqs: RF-15
- Test: should throw error for formats without contest ID | Route: service codeforces.getProblemInfo | Expected HTTP: N/A | Reqs: RF-15
## getStudentKPIs
- Test: should return KPI object with rating, solvedTotal, and streakDays in test mode | Route: service codeforces.getStudentKPIs | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
- Test: should return specific test values in test mode | Route: service codeforces.getStudentKPIs | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
## getStudentRatingGraph
- Test: should return rating graph with min, max, and series in test mode | Route: service codeforces.getStudentRatingGraph | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
- Test: should return series with date and rating properties | Route: service codeforces.getStudentRatingGraph | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
- Test: should have min <= max in test mode | Route: service codeforces.getStudentRatingGraph | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
## getStudentSolvesByRating
- Test: should return solves by rating with binSize and bins in test mode | Route: service codeforces.getStudentSolvesByRating | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-50; RF-51
- Test: should return bins with from, to, label, and solved properties | Route: service codeforces.getStudentSolvesByRating | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-50; RF-51
- Test: should have proper bin ranges (to = from + binSize - 1) | Route: service codeforces.getStudentSolvesByRating | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-50; RF-51
## getStudentSolvedTags
- Test: should return array of tag objects in test mode | Route: service codeforces.getStudentSolvedTags | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
- Test: should return tags with correct structure | Route: service codeforces.getStudentSolvedTags | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
## getRandomUnsolvedFilteredProblem
- Test: should return a problem with correct structure in test mode | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should return a problem with rating within the specified range | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should return a problem with the specified tags | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should handle low rating range | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should handle high rating range | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should return cf_code in correct format | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should return valid contest ID | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should return a name for the problem | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41

# Codeforces Service - Integration Tests (Real API)
## verifyProblemSolved - Real API
- Test: should confirm that fisher199 has solved 1720D1 | Route: service codeforces.verifyProblemSolved | Expected HTTP: N/A | Reqs: RF-40; RF-41; RF-42
- Test: should confirm that fisher199 has NOT solved 1A | Route: service codeforces.verifyProblemSolved | Expected HTTP: N/A | Reqs: RF-40; RF-41
- Test: should return an object with solved and completionType properties | Route: service codeforces.verifyProblemSolved | Expected HTTP: N/A | Reqs: RF-40; RF-41; RF-42
- Test: should properly distinguish between contest and normal submissions | Route: service codeforces.verifyProblemSolved | Expected HTTP: N/A | Reqs: RF-40; RF-41; RF-42
## validateCfCode - Real API
- Test: should validate that 1720D1 is a real problem | Route: service codeforces.validateCfCode | Expected HTTP: N/A | Reqs: RF-15
- Test: should validate that 1A is a real problem | Route: service codeforces.validateCfCode | Expected HTTP: N/A | Reqs: RF-15
- Test: should return false for non-existent problem code | Route: service codeforces.validateCfCode | Expected HTTP: N/A | Reqs: RF-15
- Test: should return false for invalid format | Route: service codeforces.validateCfCode | Expected HTTP: N/A | Reqs: RF-15
## getProblemInfo - Real API
- Test: should retrieve info for problem 1720D1 | Route: service codeforces.getProblemInfo | Expected HTTP: N/A | Reqs: RF-15
- Test: should retrieve info for problem 1A | Route: service codeforces.getProblemInfo | Expected HTTP: N/A | Reqs: RF-15
- Test: should return exists=false for non-existent problem | Route: service codeforces.getProblemInfo | Expected HTTP: N/A | Reqs: RF-15
- Test: should return proper structure with contestId and problemIndex | Route: service codeforces.getProblemInfo | Expected HTTP: N/A | Reqs: RF-15
## verifyExistingCodeforcesAccount - Real API
- Test: should confirm that fisher199 exists on Codeforces | Route: service codeforces.verifyExistingCodeforcesAccount | Expected HTTP: N/A | Reqs: RF-14; RF-15
- Test: should handle non-existent users gracefully | Route: service codeforces.verifyExistingCodeforcesAccount | Expected HTTP: N/A | Reqs: RF-14; RF-15
- Test: should be case-sensitive for handles | Route: service codeforces.verifyExistingCodeforcesAccount | Expected HTTP: N/A | Reqs: RF-14; RF-15
## getUserInfo - Real API
- Test: should retrieve information about fisher199 | Route: service codeforces.getUserInfo | Expected HTTP: N/A | Reqs: RF-5
- Test: should return valid user data structure | Route: service codeforces.getUserInfo | Expected HTTP: N/A | Reqs: RF-5
- Test: should return null for non-existent user | Route: service codeforces.getUserInfo | Expected HTTP: N/A | Reqs: RF-5
## getUserSubmissions - Real API
- Test: should retrieve submissions for fisher199 | Route: service codeforces.getUserSubmissions | Expected HTTP: N/A | Reqs: RF-5; RF-40; RF-41
- Test: should return submission objects with proper structure | Route: service codeforces.getUserSubmissions | Expected HTTP: N/A | Reqs: RF-5; RF-40; RF-41
- Test: should support pagination | Route: service codeforces.getUserSubmissions | Expected HTTP: N/A | Reqs: RF-5; RF-40; RF-41
- Test: should respect the count parameter | Route: service codeforces.getUserSubmissions | Expected HTTP: N/A | Reqs: RF-5; RF-40; RF-41
## getRandomValidProblem - Real API
- Test: should return a valid random problem | Route: service codeforces.getRandomValidProblem | Expected HTTP: N/A | Reqs: RF-36
- Test: should return a properly formatted cf_code | Route: service codeforces.getRandomValidProblem | Expected HTTP: N/A | Reqs: RF-36
- Test: should return different problems on multiple calls | Route: service codeforces.getRandomValidProblem | Expected HTTP: N/A | Reqs: RF-36
- Test: should return problem with valid metadata | Route: service codeforces.getRandomValidProblem | Expected HTTP: N/A | Reqs: RF-36
## API Consistency Tests
- Test: verifyProblemSolved and validateCfCode should be consistent for solved problem | Route: service codeforces.verifyProblemSolved + validateCfCode | Expected HTTP: N/A | Reqs: RF-40; RF-41; RF-15
- Test: should find solved problem in user submissions | Route: service codeforces.getUserSubmissions | Expected HTTP: N/A | Reqs: RF-40; RF-41
- Test: userInfo should confirm fisher199 is a real account | Route: service codeforces.getUserInfo + verifyExistingCodeforcesAccount | Expected HTTP: N/A | Reqs: RF-14; RF-15
## Error Handling - Real API
- Test: should throw error for invalid cf_code format in verifyProblemSolved | Route: service codeforces.verifyProblemSolved | Expected HTTP: N/A | Reqs: RF-40; RF-41
- Test: should throw error for invalid cf_code format in getProblemInfo | Route: service codeforces.getProblemInfo | Expected HTTP: N/A | Reqs: RF-15
## getStudentKPIs - Real API
- Test: should retrieve KPIs for fisher199 | Route: service codeforces.getStudentKPIs | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
- Test: should return correct structure with number types | Route: service codeforces.getStudentKPIs | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
- Test: should return non-negative values | Route: service codeforces.getStudentKPIs | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
## getStudentRatingGraph - Real API
- Test: should retrieve rating graph for fisher199 | Route: service codeforces.getStudentRatingGraph | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
- Test: should return properly structured series | Route: service codeforces.getStudentRatingGraph | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
- Test: should have consistent min/max values | Route: service codeforces.getStudentRatingGraph | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
## getStudentSolvesByRating - Real API
- Test: should retrieve solves by rating for fisher199 | Route: service codeforces.getStudentSolvesByRating | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-50; RF-51
- Test: should return properly structured bins | Route: service codeforces.getStudentSolvesByRating | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-50; RF-51
- Test: should have correct bin ranges | Route: service codeforces.getStudentSolvesByRating | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-50; RF-51
- Test: should only include bins with solved > 0 | Route: service codeforces.getStudentSolvesByRating | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-50; RF-51
## getStudentSolvedTags - Real API
- Test: should retrieve solved tags for fisher199 | Route: service codeforces.getStudentSolvedTags | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
- Test: should return properly structured tag objects | Route: service codeforces.getStudentSolvedTags | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
- Test: should return tags sorted by solved count in descending order | Route: service codeforces.getStudentSolvedTags | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
- Test: should not have duplicate tags | Route: service codeforces.getStudentSolvedTags | Expected HTTP: N/A | Reqs: RF-5; RF-49; RF-51
## getRandomUnsolvedFilteredProblem - Real API
- Test: should return a problem matching filter criteria | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should return a problem with rating within specified range | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should return a problem containing all required tags | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should return cf_code in correct format | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should return a valid problem from codeforces | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should handle multiple tags filter | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
- Test: should return different problems on multiple calls | Route: service codeforces.getRandomUnsolvedFilteredProblem | Expected HTTP: N/A | Reqs: RF-36; RF-41
