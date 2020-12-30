const spLat = -23.550520
const spLong = -46.633308
let circles
let info

mapboxgl.accessToken = mapBoxApi
const map = new mapboxgl.Map({
  container: "mapid",
  style: "mapbox://styles/luizamorim/ckal3pq3x0mpy1ipvxf529xbx",
  center: [spLong, spLat],
  zoom: 12,
})
map.addControl(new mapboxgl.NavigationControl())

const container = map.getCanvasContainer()
const svg = d3
  .select(container)
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .style("position", "absolute")
  .style("z-index", 2)

circles = d3
  .csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vTCy237VAgDdePjsEjQkuZqYPOLwLA3DW7lhWhbcx2-KWwvfMK_liUdcO74G0Pnng/pub?gid=1159701123&single=true&output=csv")

  .then(function (data) {

    const treatedData = data
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (data[i].lat === data[j].lat) {
          treatedData[i].lat = parseFloat(treatedData[i].lat) + Math.random() * 0.0008
          treatedData[i].long = parseFloat(treatedData[i].long) + Math.random() * 0.0008
        }
      }
    }

    const legend = d3.select('#legend')
    const distance = 15
    const spacing = 25

    const unique = treatedData.map(item => item.genero)
      .filter((value, index, self) => self.indexOf(value) === index)

    legend.selectAll("mydots")
      .data(unique)
      .enter()
      .append("circle")
      .attr("cx", distance)
      .attr("cy", function (d, i) {
        return distance + i * spacing
      })
      .attr("r", 5)
      .attr("class", function (d) {
        return d
      })

    legend.selectAll("mylabels")
      .data(unique)
      .enter()
      .append("text")
      .attr("x", distance * 1.7)
      .attr("y", function (d, i) {
        return distance + i * spacing
      })
      .attr("class", '.endereco')
      .text(function (d) {
        return d[0].toUpperCase() + d.slice(1)
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")


    let dotsOnMap = svg
      .selectAll("circle")
      .data(treatedData)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("id", function (d, i) {
        return i
      })
      .attr("class", function (d) {
        if (d.genero === 'não figurativo') {
          return 'outros'
        } else {
          return d.genero
        }
      })

      .on("mouseover", function (event, d) {

        d3.select(this)
          .transition()
          .attr("r", 10)

        d3.select("#tooltip")
          .html(
            `<div class="row"></div>
            <div class="col"></div>
            <p class="title">${d.nome}</p>
            <p class="data"> ${d.tipo} em ${d.materia}</p>
            <p class="data"><b>${d.autor}</b> - ${d.data}</p>
            <p class="endereco"><b>Endereço:</b> ${d.endereco}</p>`
          )
          .style("left", event.pageX - 80 + "px")
          .style("top", event.pageY - 150 + "px")
          .transition()
          .style("opacity", 1)
      })

      .on("mouseout", function (event, d) {
        d3.select("#tooltip")
          .transition()
          .style("opacity", 0)
        d3.select(this)
          .attr("class", function (d) {
            if (d.genero === 'não figurativo') {
              return 'outros'
            } else {
              return d.genero
            }
          })
          .transition()
          .attr("r", 5)
      })

    render()
    map.on("viewreset", render)
    map.on("move", render)
    map.on("moveend", render)

    function project(d) {
      return map.project(new mapboxgl.LngLat(d.long, d.lat))
    }

    function render() {
      dotsOnMap
        .attr("cx", function (d) {
          return project(d).x
        })
        .attr("cy", function (d) {
          return project(d).y
        })
    }
  })