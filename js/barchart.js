/**
 * Created by quek on 21/10/2014.
 */



$(function(){

    $( "#tags" ).autocomplete({
        source: Object.keys(data['Counts']),
        minLength: 2
    });
    $("#tags" ).autocomplete({
        focus: function(event, ui){
            UserInput = $(ui)[0].item.value;

            barplot($( "#plotType option:selected" ).text(), UserInput)

        }
    });


    $("#plotType").change(function(){
        barplot($( "#plotType option:selected" ).text(),   $("#tags").val())
    })



})





var constructLocal = function(subdata, defaultOrder){

    return defaultOrder.map(function(item){
        return {'Patient' : item , 'Value' : subdata[item] }
    })


}


var findMax = function(objList) {
    var val_list = Object.keys(objList).map(function(item){
        return objList[item]})
    return d3.max(val_list)
}








var barplot = function(plot_type, gene_name) {
    d3.select("svg")
        .remove();
    var defaultOrder = data['Order']
    console.log('defuulat',defaultOrder)
    var subData = data[plot_type][gene_name]
    subData = constructLocal(subData, defaultOrder)
    var classification  = data['Classification']

    var margin = {top: 50, right: 50, bottom: 100, left: 40, legend : 200},
        width = 960 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom -  margin.legend ;


    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1, 1)


    var colourScale = d3.scale.category10()
        .domain(['AK','IEC','SCC']);


    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");


    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>value :</strong> <span style='color:red'>" + d.Value + "</span>";
        });


    var svg = d3.select("#plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip)

    x.domain(subData.map(function(d) { return d.Patient; }));
    y.domain([0, d3.max(subData, function(d) { return d.Value; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-90)"
        });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(plot_type);

    svg.selectAll(".bar")
        .data(subData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.Patient); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.Value); })
        .attr("height", function(d) { return height - y(d.Value); })
        .attr("fill", function(d) { return colourScale(classification[d.Patient])})
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)


    svg.append('text')
       .attr('x', 0 )
       .attr('y', -10)
       .text('Gene : ' +gene_name)






    legend = svg.append("g")
        .attr("class","legend")
        .attr("x",20)
        .attr("y",20)
        .attr("height", 20)
        .attr("width",20)
        .style("font-size","12px")

    legend.selectAll('rect')
        .data(['AK','IEC','SCC'])
        .enter()
        .append("rect")
        .attr("x", function(d, i) {return (40 * i) })
        .attr("y", 700 - margin.legend - 50)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d) {
            var color = colourScale(d);
            return color;
        })

    legend.selectAll('text')
        .data(['AK','IEC','SCC'])
        .enter()
        .append('text')
        .attr("x", function(d, i) {return (40 * i) +15 })
        .attr("y", 700 - margin.legend - 40)
        .text(function(d){return d})


    var sortValue = function(){
        if ( $('#sortValue').prop('checked')){
            var sorted = subData.sort(function(a,b){ return b.Value - a.Value;})
            var returnDomain = sorted.map(function(d){return d.Patient})
            return returnDomain
        }
        else {
            return data['Order']
        }

    }


    d3.select("#sortValue").on("change", change);

    var sortTimeout = setTimeout(function() {
        d3.select("#sortValue").property("checked", true).each(change);
    }, 2000);

    function change() {
        clearTimeout(sortTimeout);

        // Copy-on-write since tweens are evaluated after a delay.
        /*
        var x0 = x.domain(subData.sort(this.checked
            ? function(a, b) { return b.Value - a.Value; }
            : function(a, b) { return d3.ascending(a.Patient, b.Patient); })
            .map(function(d) { return d.Patient; }))
            .copy();
        */
        var x0 = x.domain(sortValue()).copy();

        var transition = svg.transition().duration(750),
            delay = function(d, i) { return i * 50; };

        transition.selectAll(".bar")
            .delay(delay)
            .attr("x", function(d) { return x0(d.Patient); })
        ;

        transition.select(".x.axis")
            .call(xAxis)
            .selectAll("g")
            .delay(delay)

            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-90)"
            });


    }

}