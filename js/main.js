const baseURL = "https://www.reddit.com/r/";
var app = new Vue({
    el: '#app',
    data: {
        subreddit: "twice",
        limit: 100,
        category: "new",
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
            piechart.style.display = "none";
            for (let i = 0; i < this.keywords.length; i++) {
                const keyword = this.keywords[i];
                keyword.count = 0;
            }
            document.getElementById('piechart').style.display = "none";

            makeRequest(baseURL + this.subreddit + "/" + this.category + ".json?limit=100", "GET", this.parsePosts)
        },
        addAnother: function () {
            this.keywords.push({ label: "", count: 0 });
        },
        removeItem: function (i) {
            this.keywords.splice(i, 1);
        },
        parsePosts: function (response) {
            response = JSON.parse(response);
            for (let i = 0; i < response.data.children.length; i++) {
                this.current++;
                if (this.current > this.limit) {
                    google.charts.load('current', { 'packages': ['corechart'] });
                    google.charts.setOnLoadCallback(this.drawGraph);
                    return;
                }
                const post = response.data.children[i];
                let foundOne = false;
                for (let j = 0; j < this.keywords.length; j++) {
                    const keyword = this.keywords[j];

                    if (post.data.title) {
                        if (post.data.title.toUpperCase().indexOf(keyword.label.toUpperCase()) > -1) {
                            keyword.count++;
                            foundOne = true;
                        }
                    }
                }
                if (!foundOne) {
                    this.otherCounter++;
                }
            }
            // recursively calls it self.
            makeRequest(baseURL + this.subreddit + "/" + this.category + ".json?limit=100&after=" + response.data.after, "GET", this.parsePosts);
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

            for (let i = 0; i < tempKeyWords.length; i++) {
                const keyword = tempKeyWords[i];
                preData.push([keyword.label, keyword.count]);
            }
            let data = google.visualization.arrayToDataTable(preData);

            var options = {
                title: 'Top Reddit Posts on ' + this.subreddit,
                pieSliceText: 'label',
            };
            document.getElementById('piechart').style.display = "block";
            var chart = new google.visualization.PieChart(document.getElementById('piechart'));

            chart.draw(data, options);

            document.getElementById('piechart').scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
})