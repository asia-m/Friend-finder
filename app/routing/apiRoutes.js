const fs = require("fs");
const path = require("path");

const express = require("express");

const router = express.Router();

const p = path.join(
    path.dirname(process.mainModule.filename),
    "app/data",
    "friends.json"
);

const getFriendsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
};

const matchFriend = (user, friends) => {
    return friends
        .map(friend => {
            const total = friend.scores.reduce((totalScore, score, idx) => {
                totalScore += Math.abs(user.scores[idx] - score);
                return totalScore;
            }, 0);
            return {
                ...friend,
                total
            };
        })
        .sort((a, b) => a.total - b.total)[0];
};

router.post("/api/friends", (req, res) => {
    var user = req.body;
    getFriendsFromFile(friends => {
        let results = {
            name: "No Friends have completed survey"
        };
        if (friends.length > 1) {
            results = matchFriend(user, friends);
        }
        friends.push(user);
        fs.writeFile(p, JSON.stringify(friends), err => {
            console.log(err);
        });

        res.send(results);
        return results;
    });
});

router.get("/api/friends", (req, res) => {
    getFriendsFromFile(friends => {
        res.json(friends);
    });
});

router.get("*", (req, res) => {
    res.status(404).redirect("/");
});

module.exports = router;