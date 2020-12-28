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
  .csv("data/lista-monumentos.csv")

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

    let dots = svg
      .selectAll("circle")
      .data(treatedData)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("id", function (d, i) {
        return i
      })
      .attr("class", "unselected")
      .on("mouseover", function (event, d) {

        d3.select(this)
          .attr("class", "selected")
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
          .attr("class", "unselected")
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
      dots
        .attr("cx", function (d) {
          return project(d).x
        })
        .attr("cy", function (d) {
          return project(d).y
        })
    }
  })