const baseURL = "https://api.pushshift.io/reddit/submission/search";
const fields = "title,id,full_link,created_utc,score,author,removed_by_category"
let data;
var app = new Vue({
    el: '#app',
    data: {
        subreddit: "twice",
        limit: 100,
        category: "created_utc",
        title: "Most Posted Members in r/twice",
        message: "",
        fullposts: [],
        showposts: false,
        tempfields: "",
        keywords: [
            {
                label: "Jihyo",
                count: 0,
                score: 0
            },
            {
                label: "Nayeon",
                count: 0,
                score: 0
            },
            {
                label: "Jeongyeon",
                count: 0,
                score: 0
            },
            {
                label: "Momo",
                count: 0,
                score: 0
            },
            {
                label: "Sana",
                count: 0,
                score: 0
            },
            {
                label: "Mina",
                count: 0,
                score: 0
            },
            {
                label: "Dahyun",
                count: 0,
                score: 0
            },
            {
                label: "Chaeyoung",
                count: 0,
                score: 0
            },
            {
                label: "Tzuyu",
                count: 0,
                score: 0
            },
        ],
        current: 0,
        otherCounter: 0,
        otherScore: 0,
        includeOther: false,
        compareScore: false
    },
    methods: {
        getPosts: function (e) {
            e.preventDefault();
            tempfields = fields
            this.current = 0;
            this.otherCounter = 0;
            this.message = "";
            for (let i = 0; i < this.keywords.length; i++) {
                const keyword = this.keywords[i];
                keyword.count = 0;
            }
            this.fullposts = []
            document.getElementById('chartContainer').style.display = "none";
            if (this.showposts) {
                tempfields += ",preview,url"
            }
            const params = {
                subreddit: this.subreddit,
                sort_type: this.category,
                size: this.limit > 500 ? 500 : this.limit,
                fields: tempfields
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

                if (post.author == "[deleted]" || post.removed_by_category) {
                    lastID = post.created_utc
                    continue;
                }
                let foundOne = false;
                for (let j = 0; j < this.keywords.length; j++) {
                    const keyword = this.keywords[j];

                    if (post.title) {
                        if (post.title.toUpperCase().indexOf(keyword.label.toUpperCase()) > -1) {
                            keyword.count++;
                            keyword.score += post.score;
                            if (this.showposts && !foundOne) {
                                this.fullposts.push(post)
                            }
                            foundOne = true;


                        }
                    }
                }
                if (!foundOne) {
                    this.otherCounter++;
                    this.otherScore += post.score
                }

                this.current++;
                if (this.current >= this.limit) {
                    google.charts.load('current', { 'packages': ['corechart'] });
                    google.charts.setOnLoadCallback(this.drawGraph);
                    return;
                }


                lastID = post.created_utc
            }

            //No More Posts in here, creating chart
            if (lastID == "") {
                google.charts.load('current', { 'packages': ['corechart'] });
                google.charts.setOnLoadCallback(this.drawGraph);
                this.message = "This subreddit only has " + this.current + " posts"
                return;
            }

            // recursively calls it self.
            const params = {
                subreddit: this.subreddit,
                sort_type: this.category,
                before: lastID,
                size: this.limit - this.current > 500 ? 500 : this.limit - this.current,
                fields: fields
            }
            // this.drawGraph();
            makeGETRequest(baseURL, params, this.parsePosts)

        },
        drawGraph: function () {
            let preData = [
                ['Keyword', 'Number']
            ];


            //duplicate object
            let tempKeyWords = JSON.parse(JSON.stringify(this.keywords));
            if (this.includeOther) {
                tempKeyWords.push({ label: "Other", count: this.otherCounter, score: this.otherScore });
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
            // }

            data = google.visualization.arrayToDataTable(preData);

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
        },
        getPreview: function (post) {
            if (post && post.preview && post.preview.images && post.preview.images[0].resolutions) {
                let res = post.preview.images[0].resolutions
                if (res.length > 0) {
                    let img = res[res.length - 1].url.split("&amp;").join("&")
                    return this.getImage(img, post.title)
                }
            } else {
                if (post && post.url) {
                    if (post.url.indexOf("gfycat.com") > -1) {
                        let url = post.url
                        if (post.url.indexOf("-") > -1) {
                            url = post.url.substr(0, post.url.indexOf("-"))
                        }
                        console.log("post.url", post.url, url.replace("gfycat.com/", "gfycat.com/ifr/"))

                        return "<iframe src='" + url.replace("gfycat.com/", "gfycat.com/ifr/") + "' frameborder='0' scrolling='no' allowfullscreen></iframe>"
                    }


                    if (post.url.indexOf("i.redd.it") > -1) {
                        return this.getImage(post.url, post.title)
                    }
                    if (post.url.indexOf("imgur.com") > -1) {

                        return this.getImage("https://media.glassdoor.com/sqll/900384/imgur-squarelogo-1512690375276.png")
                    }
                    //didn't find an image
                    return ""
                }
            }
        },
        getImage(src, alt) {
            return "<img class='' src='" + src + "' alt='" + alt + "'>"

        }
    }
})
