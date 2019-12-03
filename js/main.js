const baseURL = "https://api.pushshift.io/reddit/submission/search";
const fields = "title,id,full_link,created_utc"
var app = new Vue({
    el: '#app',
    data: {
        subreddit: "twice",
        limit: 100,
        category: "created_utc",
        title: "Most Posted Members in /r/twice",
        keywords: [
            {
                label: "Jihyo",
                count: 0
            },
            {
                label: "Nayeon",
                count: 0
            },
            {
                label: "Jeongyeon",
                count: 0
            },
            {
                label: "Momo",
                count: 0
            },
            {
                label: "Sana",
                count: 0
            },
            {
                label: "Mina",
                count: 0
            },
            {
                label: "Dahyun",
                count: 0
            },
            {
                label: "Chaeyoung",
                count: 0
            },
            {
                label: "Tzuyu",
                count: 0
            },
        ],
        current: 0,
        otherCounter: 0,
        includeOther: false
    },
    methods: {
        getPosts: function (e) {
            e.preventDefault();
            this.current = 0;
            this.otherCounter = 0;
            for (let i = 0; i < this.keywords.length; i++) {
                const keyword = this.keywords[i];
                keyword.count = 0;
            }
            document.getElementById('chartContainer').style.display = "none";
            const params = {
                subreddit: this.subreddit,
                sort_type: this.category,
                size: 100,
                fields: fields
            }
            makeGETRequest(baseURL, params, this.parsePosts)
        },
        addAnother: function () {
            this.keywords.push({ label: "", count: 0 });
        },
        removeItem: function (i) {
            this.keywords.splice(i, 1);
        },
        parsePosts: function (response) {
            response = JSON.parse(response);
            let lastID = "";
            for (let i = 0; i < response.data.length; i++) {
                const post = response.data[i];
                let foundOne = false;
                for (let j = 0; j < this.keywords.length; j++) {
                    const keyword = this.keywords[j];

                    if (post.title) {
                        if (post.title.toUpperCase().indexOf(keyword.label.toUpperCase()) > -1) {
                            keyword.count++;
                            foundOne = true;
                        }
                    }
                }
                if (!foundOne) {
                    this.otherCounter++;
                }

                this.current++;
                if (this.current >= this.limit) {
                    google.charts.load('current', { 'packages': ['corechart'] });
                    google.charts.setOnLoadCallback(this.drawGraph);
                    return;
                }


                lastID = post.created_utc
            }
            // recursively calls it self.
            const params = {
                subreddit: this.subreddit,
                sort_type: this.category,
                before: lastID,
                size: 100,
                fields: fields
            }
            makeGETRequest(baseURL, params, this.parsePosts)

        },
        drawGraph: function () {

            let preData = [
                ['Keyword', 'Number']
            ];
            //duplicate object
            let tempKeyWords = JSON.parse(JSON.stringify(this.keywords));

            if (this.includeOther) {
                tempKeyWords.push({ label: "Other", count: this.otherCounter });
            }
            tempKeyWords = tempKeyWords.sort((a, b) => { return naturalSorter(b.count + "", a.count + "") });
            let total = 0;
            for (let i = 0; i < tempKeyWords.length; i++) {
                total += tempKeyWords[i].count;

            }

            for (let i = 0; i < tempKeyWords.length; i++) {
                const keyword = tempKeyWords[i];
                preData.push([keyword.label + ": " + Math.round(keyword.count / total * 1000) / 10 + "%", keyword.count]);
            }
            let data = google.visualization.arrayToDataTable(preData);

            var options = {
                title: this.title,
                pieSliceText: 'percentage',

            };
            document.getElementById('chartContainer').style.display = "block";
            var chart = new google.visualization.PieChart(document.getElementById('piechart'));

            chart.draw(data, options);

            document.getElementById('piechart').scrollIntoView({
                behavior: 'smooth'
            });
            document.getElementById('download').href = chart.getImageURI()
        }
    }
})