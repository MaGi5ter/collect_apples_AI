var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var health = document.getElementById('health')

let who_play = 1              // 0 human // 1 bot
let train_data = []

const net = new brain.NeuralNetwork({
    hiddenLayers: [3, 6]
});

net.train([
    {input: {angle: 0.08163411387596742}, output: {down: 1,up: 0,left: 0,right: 0}},
    {input: {angle: 0.15485941709648385}, output: {down: 0,up: 0,left: 1,right: 0}},
    {input: {angle: 0.2706585431775636}, output: {down: 0,up: 1,left: 0,right: 0}},
    {input: {angle: 0.35724089234137973}, output: {down: 0,up: 0,left: 0,right: 1}}    ]
)

canvas.width = document.querySelector('#canvas').clientWidth
canvas.height = document.querySelector('#canvas').clientHeight

class Player {
    constructor(x,y,health,size) {
        this.x = x;
        this.y = y;
        this.health = health
        this.size = size
    }
    draw() {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(this.x , this.y , this.size , this.size)
    }
    update(horizon , vertic) {
        this.x += horizon
        this.y += vertic
    }
    healthc(reduce) {
        this.health += reduce 
    }
}

class Food {
    constructor(x,y,size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }
    draw() {
        ctx.fillStyle = "green";
        ctx.fillRect(this.x , this.y , this.size , this.size)
    }
    update(newx , newy) {
        this.x = newx
        this.y = newy

        console.log('Food:',this.x,this.y)
    }
}

let x = Math.floor(Math.random() * canvas.width)
let y = Math.floor(Math.random() * canvas.height)

let food    = new Food(x,y,15)
let player  = new Player(300,300,350,25)

let last_distance

async function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await aimove()

    food.draw()
    player.draw()

    //check if touch
    if(
        (player.x + player.size >= food.x && player.x <= food.x + food.size) 
    &&  (player.y + player.size >= food.y && player.y <= food.y + food.size) 
    ) {
        let x = Math.floor(Math.random() * canvas.width)
        let y = Math.floor(Math.random() * canvas.height)

        food.update(x,y)
        player.healthc(300)
    }

    health.innerHTML = `health: ${player.health}`

    setTimeout(() => {
        player.healthc(-1)
      
        if(player.health < 0) {

            console.log(train_data)

            if(train_data[0] != undefined) {
                net.train(train_data)
            }
            train_data = []
            // alert('You Died')

            let x1 = Math.floor(Math.random() * canvas.width)
            let y1 = Math.floor(Math.random() * canvas.height)
            player = new Player(x1,y1,350,25)

            let x = Math.floor(Math.random() * canvas.width)
            let y = Math.floor(Math.random() * canvas.height)

            food = new Food(x,y,15)

            last_distance = distance()

            draw()
            
        }
        else draw()
        
    }, 20);
}


async function aimove() {                                                  // at first i was putting here coordinates but it doesnt worked well but
    let angle_to_food = Math.atan2(food.y - player.y , food.x - player.x) //after a while i realized that it needs actually just angle to point
    angle_to_food = angle_to_food * 180 / Math.PI
    if(angle_to_food < 0) angle_to_food += 360
    angle_to_food = angle_to_food/1000



    let move = net.run({angle: angle_to_food})

    // // console.log({fx: food.x , fy: food.y, px: player.x , py: player.y})
    let name = ''
    let number = 0
    for (const key in move) {
        if(move[key] > number){
            number = move[key]
            name = key
        }
    }

    console.log(move)

    if(who_play == 1) {
        if(name == 'left') {
            player.update(-5, 0)
        }
        else if(name == 'right') {
            player.update(5, 0)
        }
        else if(name == 'up') {
            player.update(0, -5)
        }
        else if(name == 'down') {
            player.update(0, 5)
        }
    }

}

document.addEventListener(`keydown`, e => {
    let angle_to_food = Math.atan2(food.y - player.y , food.x - player.x) 
    angle_to_food = angle_to_food * 180 / Math.PI
    if(angle_to_food < 0) angle_to_food += 360
    angle_to_food = angle_to_food/1000


    if(e.key == 'ArrowUp') {
        check_data({input: {angle: angle_to_food}, output: {up: 1}})
        player.update(0, -5)
    }  
    if(e.key == 'ArrowDown') {
        check_data({input: {angle: angle_to_food}, output: {down: 1}})
        player.update(0, 5)
    }
    if(e.key == 'ArrowLeft') {
        check_data({input: {angle: angle_to_food}, output: {left: 1,}})
        player.update(-5, 0)    
    }   
    if(e.key == 'ArrowRight'){
        check_data({input: {angle: angle_to_food}, output: {right: 1}})
        player.update(5, 0)       
    }
})

function check_data(data) {
    //data {input: {angle: 3247}, output: {up: 1}}
    if(last_distance > distance()) {
        console.log(data)
        train_data.push(data)
    }

    last_distance = distance()
}

function distance(){
    return Math.sqrt( (food.x - player.x)**2 + (food.y - player.y)**2 )
}

function switch_() {
    if(who_play == 0 ) who_play = 1
    else if(who_play == 1) who_play = 0
}

function save() {
    let save = net.toJSON()
    console.log(save)
    console.log(JSON.stringify(save))
}

draw()