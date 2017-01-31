// source : http://bl.ocks.org/mbostock/1705868
// links - 
// examples : https://github.com/d3/d3/releases/v3.0.0
// docs - transition - https://github.com/d3/d3-3.x-api-reference/blob/master/Transitions.md

color = d3.scale.category10().domain(d3.range(4));

ENEMY_TRANSITION_TIME = 20000;
BULLET_IMPACT_TIME = 500;
ENEMY_COUNT = 50;
MONEY = {
  balance : 100,
};

TURRET_COST = 50;
ROUND_TRIP_COST = 100;
CREDIT_PER_HIT = 5;
PER_BULLET_COST = 0;


var bank = bank();

function bank(){

  return {
    debit : debit,
    credit : credit,
    balance : balance
  }

  function debit(amt){
    if(amt < 0){
      return;
    }
    MONEY.balance = MONEY.balance - amt;
  }

  function credit(amt){
    if(amt < 0){
      return;
    }
    MONEY.balance = MONEY.balance + amt;
  }

  function balance(){
    return MONEY.balance;
  }

}

m_enemies_alive = ENEMY_COUNT;
m_collisions = 0;

function container(svg){
  var points = [
    [480, 200],
    [580, 400],
    [680, 100],
    //[780, 300],
    //[180, 300],
    //[280, 100],
    [380, 400]
  ];


  var _points = []
  for (i=0;i<points.length;i++){
  
      _x = Math.random() * (width - 0) + 0;
      _y = Math.random() * (height - 0) + 0;
      _points[i] = [_x, _y];
      
       //return Math.random() * (max - min) + min;
  }
  
  function genPath(__points__){
    return svg.append("path")
      .data([__points__])
      .attr("d", d3.svg.line()
      .tension(1) // Catmull–Rom
      .interpolate("cardinal-closed")
      )
      .classed("highway", true);
  }
  function genPoints(){
    var __points__ = []
    
    // for (var i=0;i<_points.length;i++){
    //     _x = Math.random() * (width - 0) + 0;
    //     _y = Math.random() * (height - 0) + 0;
    //     __points__[i] = [_x, _y];
    //      //return Math.random() * (max - min) + min;
    // }

    __points__ =[
      [0,40],
      [40,40],
      [40,height/2+20],
      [160,height/2+20],
      [160, 10],
      [width/2 + 60, 10],
      [width/2 + 60, height/2+20],
      [width/2 + 180, height/2+20],
      [width/2 + 180, 40]
    ]

    // __points__.splice(0,0,[10,10]);
    
    
    return __points__;
  }

  points = _points;

  if (svg == null){
  svg = d3.select("body").append("svg")
      .attr("width", 500)
      .attr("height", 300);
      }


/*
  svg.selectAll(".point")
      .data(points)
    .enter().append("circle")//.text(function(d,i){return i})
      .attr("r", 4)
      .attr("transform", function(d) { return "translate(" + d + ")"; });
  */    

  var nodes = d3.range(ENEMY_COUNT).map(function(current, index, array){
      return {i: index}
  });
  
  var circle = svg
  .selectAll("circle .enemy")
  .data(nodes.slice(0))
  .enter()
  .append("circle")
  .classed("enemy", true)
  .attr("r", 5)  
  .attr('id', function(d,i){return "enemy_"+i})
  .style("fill", function(d,i) { return /*i==5?'#AAA':'#EEE'*/          color(Math.floor(Math.random() * 4)); })
  // .attr("transform", function(d,i){return "translate(" + points[0] + ")"});
  
  circle.each(function(d,i){
     del = (i==0?100:200*i);
     _path = genPath(genPoints());
     d.path = _path;
     transition_enemy(d3.select(this), _path, del);
     }).classed("enemy", true)

  redrawScores();
     
     // function insertNew(){
     
     //  d3.selectAll("circle .enemy")
     //  //.data(nodes.slice(1))
     //  //.enter()
     //  .append("circle")
     //  .attr("r", 5)
     //  .classed("enemy", true)
     //  .style("fill", function(d) { return color(Math.floor(Math.random() * 4)); })
     //  .attr("transform", function(d,i){return "translate(" + points[0] + ")"})
     //  .each(function(d,i){
     // del = (i==0?100:200*i);
     // _path = genPath(genPoints());
     // d.path = _path;
     // transition_enemy(d3.select(this), _path, del);
     // });
      
     // }
  


  function transition() {
    circle.transition()
        .duration(ENEMY_TRANSITION_TIME)
        .ease('linear')
        .attrTween("transform", translateAlong(path.node()))
        //.each("end", transition);
  }
  
  
 var arr_turret_pos = [
        // [120, height/2+40],
        // [width - 120, height/2+40]
      ];
    
 m_turret_pos = arr_turret_pos;

 var bnodes = d3.range(0).map(function(current, index, array){
      return {i:index-1}
  });
 
 svg.on("click", function() {
          if(bank.balance()<TURRET_COST){
            showAlert("Insufficient balance")
            return;
          }
          var coords = d3.mouse(this);
          console.log("coords : %o", coords);
          // arr_turret_pos.push(coords);
          m_turret_pos.push(coords);
          addTurretAt(coords)
          bank.debit(TURRET_COST);
        });

  
  function addTurretAt(turret_pos){  
  turret = svg.append("g")
    .attr("transform", "translate(" + turret_pos[0] + "," + turret_pos[1] + ")")
    .append("path")
    .attr("d", d3.svg.symbol().type("cross").size(50))
    .classed("turret", true);
    
    turret_range = svg.selectAll(".bullet")
        .data([1])
        .enter()
        .append('circle')
        .attr('r', '100')
        .style('stroke','#DDD')
        .style('fill','none')
        .attr('transform','translate('+turret_pos[0] +',' + turret_pos[1]+')') ;

    bank.debit(TURRET_COST);
    redrawScores();
  }

  for(i = 0; i< m_turret_pos.length; i++){
    addTurretAt(m_turret_pos[i]);
  }
    
    
    
    m_new_bullet_from_to = function new_bullet_from_to(turret_pos, dest){

      var _bullet = svg
                .selectAll("circle .dyn_bullet_"+turret_pos[0]+turret_pos[1])
                .data([{i:turret_pos[0]+"_"+turret_pos[1], turret: turret_pos}])
                .enter()
                .append("circle")
                .attr("r", 5)
                .style("fill", function(d) { return /*color(Math.floor(Math.random() * 4));*/ "#000" })
                .attr("transform", function(d,i){return "translate(" + turret_pos[0] +"," + turret_pos[1]+ ")"})

      var _bullet_path_points = []
          _bullet_path_points.push([turret_pos[0] , turret_pos[1]]);
          _bullet_path_points.push([dest[0] , dest[1]]);

          // console.log('_bullet_path_points : %o', _bullet_path_points );

      var _bullet_path = svg.append("path")
              .data([_bullet_path_points])
              .attr("d", d3.svg.line()
              .tension(0.5) // Catmull–Rom
              // .interpolate("cardinal-closed")
              )
              .classed("_bullet_path", true);

          _bullet.each(function(d,i){
               // var del = (i==0?100:200*i);
               transition_bullet_in_time(d3.select(this), _bullet_path, 0, BULLET_IMPACT_TIME);
               })

          bank.debit(PER_BULLET_COST);

      function transition_bullet_in_time(el, path, delayms, time) {
              t = el
              .transition();
                  t.delay(delayms)
                  .duration(time)
                  .ease('linear')
                  // .attrTween("transform", translateBulletAlong(path.node()))
                  .tween("attr", translateBulletAlong(el, path.node(), t))
                  // .transition()
                  .each("end", function(d,i){bullet_arr[d.i]=null; el.remove(); m_shooting[d.i] = false;});
                  // .each("start", function(){el.call(transition_bullet, path, 0)});

              }
    }

    function in_range(turret_pos, dest){

      var t = turret_pos;
      var dist = Math.sqrt(Math.pow(dest[0]-t[0],2) + Math.pow(dest[1]-t[1],2));
      if(dist < 100){
        return true
      }

      return false;

    }
    
    
  //   function transition_bullet(el, path, delayms) {
  //   var t = el
  //   .transition();
  //       t.delay(delayms)
  //       .duration(10000 * Math.random())
  //       .ease('linear')
  //       // .attrTween("transform", translateBulletAlong(path.node()))
  //       .tween("attr", translateBulletAlong(el, path.node(),t))
  //       .transition()
  //       .each("start", function(){el.call(transition_bullet, path, 0)});
  // }
  
  
    function translateBulletAlong(el, path, transition) {
    var l = path.getTotalLength();
    return function(d, i, a) {
      d.trans = transition;
      m_shooting[d.i] = true;
      // console.log(el.data());
      var e = el.data();
      var elem = el;
      return function(t) {
         // console.log("bullet animation : %f",t);
         if(d.destroyed){
          // console.log("destroyed bullet");
          return;
         }
         var index = e[0].i;
         var turret_pos = e[0].turret;
         // console.log("index : %i : %s", index, typeof(index));
         // console.log(index);
         // t goes from 0 to 1 incrementing accordingly for the duration of the transition.
        pointOfConcern = t * l;
        var p = path.getPointAtLength(pointOfConcern);
        // console.log("in_range : %s" , in_range([p.x, p.y]));
        // for(var i=0; i< arr_turret_pos.length; i++){
        // var turret_pos = arr_turret_pos[i]
        var is_in_range = in_range(turret_pos, [p.x, p.y]);
        if(!is_in_range){
          elem.remove();
          transition.duration(0);
          bullet_arr[index] = null;
          m_shooting[index] = false;
          return;
        }
        d.current_position = {x: p.x, y: p.y};
        bullet_arr[index] = {x: p.x, y: p.y, bullet_el:el, trans: transition, d:d};
        // console.log("bullet_arr : %o", bullet_arr);
        // return "translate(" + p.x + "," + p.y + ")";
        //var el = d3.select(this);

        elem.attr("transform","translate(" + p.x + "," + p.y + ")");       
        // }
        
       
      };
    };
  }
  
  
  function transition_enemy(el, path, delayms) {
      t = el
    .transition()
        .delay(delayms)
        .duration(ENEMY_TRANSITION_TIME)
        .ease('linear')
        .attrTween("transform", translateAlong(el, path.node()))
        .transition()
        //.each("end", function(){transition_el(el, 100)});
        .each("start", function(){
                    console.log("start"); 
                    bank.debit(ROUND_TRIP_COST); 
                    showAlert("DEBIT!!!"); 
                    redrawScores();
                    el.call(transition_enemy, path, 0)
                  })
        ;  
    
    
  }
  
  //transition();

  var _untarget = function(){
            var d1 =this;
            // console.log("untarget set for %o", d1)
            setInterval(function(){
                    d1.targeted=false; 
                    //console.log("untargeted : %o", d1); 
                    d1.untarget = null;
                  }
                ,501);
          }

  // Returns an attrTween for translating along the specified path element.
  // SVG element methods used here. Reference: https://developer.mozilla.org/en-US/docs/Web/API/SVGPathElement
  function translateAlong(el, path) {
    var l = path.getTotalLength();
    var speed = l/ENEMY_TRANSITION_TIME;
    return function(d, _i, a) {
      d.speed = speed;
      return function(t) {
        d.t = t;
        // t goes from 0 to 1 incrementing accordingly for the duration of the transition.
        pointOfConcern = t * l;
        var p = path.getPointAtLength(pointOfConcern);
        d.current_position = {x: p.x, y: p.y};
        // var bullet_pos = bullet_arr[0];

        // var is_in_range = in_range([p.x, p.y]);
        // if(is_in_range && !d.untarget){
          
        // }



        for(var i =0; i<arr_turret_pos.length; i++){

          var turret_pos = arr_turret_pos[i];

          if(in_range(turret_pos, [p.x, p.y])){

          var curr = d.current_position;
          var speed = d.speed;
          var _path = d.path;
          var t = d.t;

          var after_ms = BULLET_IMPACT_TIME;
          time_diff_ratio = BULLET_IMPACT_TIME/ENEMY_TRANSITION_TIME;
          // console.log('time_diff_ratio : %f', time_diff_ratio);

          var dest_time = t + time_diff_ratio;
          path_node = _path.node();
          var predicted = path_node.getPointAtLength(dest_time * path_node.getTotalLength());

          new_pos = predicted;
          var is_in_range = in_range(turret_pos, [new_pos.x, new_pos.y]);
          if(is_in_range){
             is_in_range = is_in_range;
          }

          if(!d.targeted && is_in_range){
            d.targeted = true;
            d.untarget = _untarget;
            d.untarget();
            if(!m_shooting[turret_pos[0]+"_"+turret_pos[1]]){
              m_shooting[turret_pos[0]+"_"+turret_pos[1]] = true;
             m_new_bullet_from_to(turret_pos, [new_pos.x, new_pos.y]);  
            }
          }

        }
        }

        
        if(bullet_arr){
        // console.log("bullet_arr2 : %o", bullet_arr);
        // console.log("bullet_arr2[0] : %o", bullet_arr[1]);
        
        for(i in bullet_arr){
        
        var bullet_pos = bullet_arr[i];
        if(bullet_pos){
          // console.log("bullet %i : %o",i, bullet_pos);
          // console.log("bullet_pos : %o", bullet_pos);

          var dist = {x: Math.abs(p.x - bullet_pos.x), y: Math.abs(p.y - bullet_pos.y)};

          if(dist.x < 5 && dist.y<5){
           if(d.hit_count){
               el.transition().duration(0);
               el.remove();
               path.remove();
               
               svg.insert("circle", "rect")
                  .attr("cx", p.x)
                  .attr("cy", p.y)
                  .attr("r", 1e-6)
                  .style("stroke", d3.hsl((i = (i + 1) % 360), 1, .5))
                  .style("stroke-opacity", 1)
                  .style("stroke-width", 2)
                  .style("fill", 'none')
                .transition()
                  .duration(500)
                  .ease(Math.sqrt)
                  .attr("r", 30)
                  .style("stroke-opacity", 1e-6)
                  .remove();

               
           }else{
             el.style('fill', 'blue')
             d.hit_count = 1;
             // console.log("d.hit_count : %i", d.hit_count);
           }
           
           // console.log("bullet_arr[i] : %o", bullet_arr[i]);
             if(bullet_arr[i] && bullet_arr[i].d){
              bullet_arr[i].d.destroyed = true;
              }
           // bullet_arr[i].trans.remove();
           // bullet_arr[i].trans = null;
           // bullet_arr[i].bullet_el.remove();
              bullet_arr[i] = null;
              //m_shooting[i] = false;
           // console.log("enemy collision!!!!");
           collisionDetected();
          
          }
        }
        }//for
        
        }
        return "translate(" + p.x + "," + p.y + ")";
      };
    };
  }
  
function getConvertedBBox(elem){
  var bbox = elem.getBBox();
  var conv = convertCoords(bbox.x, bbox.y, elem);
  return {
    x : conv.x,
    y : conv.y,
    width: bbox.width,
    height: bbox.height
  }
}  
function convertCoords(x,y, elem) {

  var offset = svg.node().getBoundingClientRect();

  var matrix = elem.getScreenCTM();

  return {
    x: (matrix.a * x) + (matrix.c * y) + matrix.e - offset.left,
    y: (matrix.b * x) + (matrix.d * y) + matrix.f - offset.top
  };
}

  function collisionDetected(){
      
      m_collisions++;
      bank.credit(CREDIT_PER_HIT);

      redrawScores();
  }

  function showAlert(text){
    var collisionText = svg.append("text")
      .attr("x", 200)
      .attr("y", 50)
      .text(text)
      .classed("collision-alert", true);
      setTimeout(function(){svg.selectAll(".collision-alert").remove(); /*console.log("removed")*/},1000);

  }

  function redrawScores(){
    m_enemies_alive = d3.selectAll(".enemy")[0].length;
      
      svg.selectAll(".enemy_alive").remove()
      var enemy_alive_label = svg.append("text")
      .attr("x", width - 100)
      .attr("y", 50)
      .text("Enemy : " + m_enemies_alive )
      .classed("legend", true)
      .classed("enemy_alive", true);

      svg.selectAll(".balance").remove()
      var balance_label = svg.append("text")
      .attr("x", width - 100)
      .attr("y", 90)
      .text("Score : " + bank.balance() )
      .classed("legend", true)
      .classed("balance", true);

      svg.selectAll(".collisions").remove()
      var collisions_label = svg.append("text")
      .attr("x", width - 100)
      .attr("y", 70)
      .text("Hits : " + m_collisions )
      .classed("legend", true)
      .classed("collisions", true);   
  }
  
  function drawBoundingBox(elem) {
    var bbox = getConvertedBBox(elem);
    var rect = svg.append("rect")
    .attr("x", bbox.x)
    .attr("y", bbox.y)
    .attr("width", bbox.width)
    .attr("height", bbox.height)
    .style("fill", "#ccc")
    .style("fill-opacity", ".3")
    .style("stroke", "red")
    .style("stroke-width", "1.5px");
  }
  
}

bullet_arr = [];

ccount = 0;
m_shooting = [];
m_turret_pos = null;
m_new_bullet_from_to = null;

function builder(svg){

  var start = [];
  var stop = [];
  var lines = [];

  var snapToEnds = true;

  svg.on("mousedown", function(){
    start = [];
    end = [];
    coords = d3.mouse(this);
    console.log("down coords : %o" , coords);

    if(snapToEnds){
      coords = getClosest(coords)
    }
      
    start = coords;
  });

  function within_range(point1, point2, range){
    var x1 = point1[0];
    var y1 = point1[1];
    var x2 = point2[0];
    var y2 = point2[1];

    if(Math.sqrt(Math.pow(Math.abs(x1)-Math.abs(x2),2) + Math.pow(Math.abs(y1)-Math.abs(y2),2)) <= range){
      return true;
    }
    return false;
  }

  function getClosest(coords){
    for(i=0;i<lines.length;i++){
      var line = lines[i];
      l_start = line[0];
      l_end = line[1];

      if(within_range(l_start, coords, 30)){
        coords = l_start;
        break;
      }

      if(within_range(l_end, coords, 30)){
        coords = l_end;
        break;
      }
    }

    return coords;
  }

  svg.on("mousemove", function(){
    if(start && start.length > 0){
      coords = d3.mouse(this);
      end = coords;
      svg.selectAll(".drawn").remove();
      draw_line(start, end, "drawn");
    }
  });

  svg.on("mouseup", function(){
    coords = d3.mouse(this);

    if(snapToEnds){
      coords = getClosest(coords)
    }
    
    end = coords;
    console.log("up coords : %o" , coords);
    draw_line(start, end);
    lines.push([start,end]);
    start = [];
    end = [];
  });

  function draw_line(start, end, _class){
    return svg
    .append("line")
    .classed("drawn", function(d){return _class==null?false:true})
    .attr("x1", start[0])
    .attr("y1", start[1])
    .attr("x2", end[0])
    .attr("y2", end[1])
    .style("stroke", "black")
  }
}

var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

width = x;
height = y;

svg = d3.select("body").append("svg")
      .attr("width", x)
      .attr("height", y);
pnp = false;




pauset = function(){pnp = true;};

container(svg);

// builder(svg);
