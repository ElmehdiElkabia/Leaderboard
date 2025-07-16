# 42 API Endpoints for Leaderboard Development

## 🏆 Core Leaderboard APIs

### **Users & Basic Info**
- `GET /v2/users` - Get all users with filtering options
- `GET /v2/users/{id}` - Get specific user details
- `GET /v2/me` - Get current authenticated user
- `GET /v2/users/graph` - User statistics and graphs
- `GET /v2/users/{id}/locations_stats` - User location statistics

### **Campus & Filtering**
- `GET /v2/campus` - Get all campuses
- `GET /v2/campus/{id}` - Get specific campus details
- `GET /v2/campus/{id}/stats` - Campus statistics
- `GET /v2/campus_users` - Users in campuses
- `GET /v2/campus/{campus_id}/users` - Users in specific campus

### **Cursus & Levels**
- `GET /v2/cursus` - Get all cursus
- `GET /v2/cursus/{id}` - Get specific cursus details
- `GET /v2/cursus_users` - Users in cursus with levels
- `GET /v2/cursus/{cursus_id}/cursus_users` - Users in specific cursus
- `GET /v2/users/{user_id}/cursus_users` - User's cursus progress

### **Skills & Experience**
- `GET /v2/skills` - Get all skills
- `GET /v2/cursus/{cursus_id}/skills` - Skills for specific cursus
- `GET /v2/experiences` - Skill experiences
- `GET /v2/users/{user_id}/experiences` - User's skill experiences

### **Projects & Progress**
- `GET /v2/projects` - Get all projects
- `GET /v2/cursus/{cursus_id}/projects` - Projects in cursus
- `GET /v2/projects_users` - Users doing projects
- `GET /v2/users/{user_id}/projects_users` - User's projects
- `GET /v2/projects/{project_id}/projects_users` - Users on specific project

### **Teams & Collaboration**
- `GET /v2/teams` - Get all teams
- `GET /v2/users/{user_id}/teams` - User's teams
- `GET /v2/teams_users` - Team members
- `GET /v2/projects/{project_id}/teams` - Teams on project

### **Evaluations & Grades**
- `GET /v2/scale_teams` - Project evaluations
- `GET /v2/users/{user_id}/scale_teams` - User's evaluations
- `GET /v2/projects/{project_id}/scale_teams` - Project evaluations

### **Achievements & Titles**
- `GET /v2/achievements` - Get all achievements
- `GET /v2/achievements_users` - Users with achievements
- `GET /v2/users/{user_id}/achievements_users` - User's achievements
- `GET /v2/titles` - Get all titles
- `GET /v2/titles_users` - Users with titles

### **Coalitions & Competition**
- `GET /v2/coalitions` - Get all coalitions
- `GET /v2/coalitions_users` - Coalition members
- `GET /v2/users/{user_id}/coalitions_users` - User's coalitions
- `GET /v2/scores` - Coalition scores

### **Locations & Activity**
- `GET /v2/locations` - User locations in campus
- `GET /v2/users/{user_id}/locations` - User's location history
- `GET /v2/campus/{campus_id}/locations` - Campus locations

### **Correction Points & Wallet**
- `GET /v2/correction_point_historics` - Correction point history
- `GET /v2/users/{user_id}/correction_point_historics` - User's correction points

## 🎯 Key Filtering Parameters

### **Common Filters**
- `?filter[campus_id]={id}` - Filter by campus
- `?filter[cursus_id]={id}` - Filter by cursus
- `?filter[user_id]={id}` - Filter by user
- `?filter[active]=true` - Only active users
- `?sort=level` - Sort by level
- `?sort=-level` - Sort by level (descending)
- `?page={num}&per_page={num}` - Pagination

### **For Moroccan Campuses**
- `?filter[campus_id]=21` - Benguerir
- `?filter[campus_id]=75` - Rabat
- `?filter[campus_id]=55` - Tétouan
- `?filter[campus_id]={khouribga_id}` - Khouribga (to be found)

## 🏅 Leaderboard Specific Endpoints

### **Top Students by Level**
```
GET /v2/cursus_users?filter[campus_id]=21&sort=-level&per_page=50
```

### **Most Active Users**
```
GET /v2/locations?filter[campus_id]=21&sort=-created_at&per_page=50
```

### **Project Completion Leaders**
```
GET /v2/projects_users?filter[campus_id]=21&filter[status]=finished&sort=-created_at
```

### **Top Evaluators**
```
GET /v2/scale_teams?filter[campus_id]=21&sort=-created_at&per_page=50
```

### **Achievement Leaders**
```
GET /v2/achievements_users?filter[campus_id]=21&sort=-created_at&per_page=50
```

### **Coalition Rankings**
```
GET /v2/coalitions_users?filter[campus_id]=21&sort=-score&per_page=50
```

## 📊 Advanced Queries

### **Students by Campus and Cursus**
```
GET /v2/cursus_users?filter[campus_id]=21&filter[cursus_id]=21&sort=-level
```

### **Project Progress by Campus**
```
GET /v2/projects_users?filter[campus_id]=21&filter[status]=in_progress
```

### **Skill Leaders**
```
GET /v2/experiences?filter[campus_id]=21&sort=-value&per_page=50
```

### **Monthly Active Users**
```
GET /v2/locations?filter[campus_id]=21&range[created_at]=2025-01-01,2025-01-31
```

## 🔄 Real-time Data

### **Live Campus Activity**
```
GET /v2/locations?filter[campus_id]=21&filter[end_at]=null
```

### **Recent Evaluations**
```
GET /v2/scale_teams?filter[campus_id]=21&sort=-created_at&per_page=20
```

### **Latest Project Submissions**
```
GET /v2/projects_users?filter[campus_id]=21&sort=-created_at&per_page=20
```

## 📈 Statistics & Analytics

### **User Growth**
```
GET /v2/users/graph?filter[campus_id]=21&on=created_at&by=month
```

### **Project Completion Rates**
```
GET /v2/projects_users/graph?filter[campus_id]=21&on=status&by=month
```

### **Evaluation Trends**
```
GET /v2/scale_teams/graph?filter[campus_id]=21&on=created_at&by=week
```

## 🎨 Display Data

### **User Profile Info**
- `id, login, displayname, email, image, level, wallet, correction_point`
- `location, pool_month, pool_year, alumni?, staff?`
- `cursus_users[].level, cursus_users[].grade, cursus_users[].skills`

### **Campus Rankings**
- Sort by: `level`, `correction_point`, `wallet`, `projects completed`
- Group by: `campus`, `cursus`, `pool_year`, `coalition`

### **Skill Rankings**
- Top skills per campus
- User skill progression
- Project-related skills

## 📝 Implementation Tips

1. **Use pagination** for large datasets (`per_page=100` max)
2. **Filter by campus** for Moroccan-specific leaderboards
3. **Sort by level** for main rankings
4. **Cache frequently accessed data** (cursus, projects, skills)
5. **Use graph endpoints** for analytics
6. **Filter by active users** for current rankings
7. **Combine multiple endpoints** for comprehensive profiles

## 🚀 Priority Implementation Order

1. **Campus filtering** - Get Moroccan students
2. **User levels** - Main leaderboard ranking
3. **Project progress** - Secondary rankings
4. **Skills display** - User profiles
5. **Achievements** - Gamification
6. **Real-time activity** - Live updates
7. **Analytics** - Graphs and statistics

## 🔗 Useful Combinations

```javascript
// Campus leaderboard with full user info
GET /v2/cursus_users?filter[campus_id]=21&sort=-level&per_page=50
    .then(users => users.map(u => ({
        ...u.user,
        level: u.level,
        grade: u.grade,
        skills: u.skills
    })))

// Multi-campus comparison
Promise.all([
    fetch('/v2/cursus_users?filter[campus_id]=21&sort=-level&per_page=10'),
    fetch('/v2/cursus_users?filter[campus_id]=75&sort=-level&per_page=10'),
    fetch('/v2/cursus_users?filter[campus_id]=55&sort=-level&per_page=10')
])
```

This comprehensive API reference should give you everything you need to build a feature-rich leaderboard for the Moroccan 1337 campuses!
