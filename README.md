# Stone Paper Scissors Game

Simple 2 player Stone Paper Scissors game. 6 rounds are played, score is shown
after every round, and final winner is shown at the end. Game data is stored
in MySQL database and can be seen on a separate "All Games" page.

## Tech used
- Frontend: React.js (Create React App) + react-router-dom + axios
- Backend: Node.js + Express.js
- Database: MySQL

## Folder structure
```
spsgame/
  backend/     -> express server + mysql connection
  frontend/    -> react app
```

## How to run on your own computer

### 1. Database setup
- Install MySQL if not already installed.
- Open MySQL and run the file `backend/schema.sql`. This will create
  database `sps_game` and table `games`.

```
mysql -u root -p < backend/schema.sql
```

### 2. Backend setup
```
cd backend
npm install
cp .env.example .env
```
Now open `.env` and put your own MySQL username/password.

Start the server:
```
npm start
```
Backend will run on http://localhost:5000

### 3. Frontend setup
Open a new terminal:
```
cd frontend
npm install
cp .env.example .env
```
`.env` already points to http://localhost:5000 for local testing.

Start the app:
```
npm start
```
Frontend will run on http://localhost:3000

## How the game works
1. Enter both player names and click Start Game.
2. Player 1 picks stone/paper/scissors first (Player 2 should look away).
3. Then Player 2 picks their choice.
4. Result of that round is shown and score updates.
5. This repeats for 6 rounds.
6. After round 6, final winner is shown and the game gets saved to database.
7. Go to "All Games" page from navbar to see history of every game played.

## Deployment (AWS / GCP free tier)

Basic idea used here - one small VM (EC2 or GCP Compute Engine) is used to
run both backend and MySQL, and frontend is built and served using nginx or
served through the same VM.

### Steps followed for AWS EC2 (t2.micro - free tier eligible)
1. Launch a t2.micro Ubuntu EC2 instance, open ports 22, 80, 5000 in security group.
2. SSH into instance, install Node.js, MySQL and nginx:
   ```
   sudo apt update
   sudo apt install nodejs npm mysql-server nginx -y
   ```
3. Setup MySQL (`sudo mysql`) and run `schema.sql`.
4. Copy `backend` folder to server, run `npm install`, set `.env` with server
   DB credentials, run backend with `pm2` so it keeps running:
   ```
   npm install -g pm2
   pm2 start server.js
   ```
5. On frontend, set `REACT_APP_API_URL` to the EC2 public IP with port 5000,
   then run `npm run build`. This creates a `build` folder.
6. Copy `build` folder content to `/var/www/html` and let nginx serve it, or
   configure nginx to point to that folder.
7. Now app is accessible on the EC2 public IP.

(Same steps work for GCP Compute Engine free tier VM as well, just the VM
creation part is different.)
