export function ds_mgrData2kakao(mgr_){
  var path_ = []
  for (const p of mgr_) {
    path_.push({
      lat: p.y,
      lng: p.x,
    })
  }
return path_;
};


export function ds_geojson2kakao(geojson_){
  var path_ = []
  for (const p of geojson_) {
    path_.push( 
      {
        lat: p[1],
        lng: p[0],
      });
    }

  if (path_[0].lat === path_.slice(-1)[0].lat && path_[0].lng === path_.slice(-1)[0].lng) path_.pop()
  
return path_;
}

export function ds_mgrData2geojson(mgr_){
  var path_ = []
  for (const p of mgr_) {
    path_.push([p.x,p.y])
  }
  path_.push(path_[0])
return path_;
};

export function ds_geojson2kakaoV2(geojson_){
  const { kakao } = window;
  var path_ = []
  for (const p of geojson_) {
    path_.push( new kakao.maps.LatLng(p[1], p[0]));
    }
  if (path_[0] === path_.slice(-1)) path_.pop()
return path_;
}


export function createGeoJSONCircle(center, radiusInKm, points) {
  if(!points) points = 64;

  var coords = {
      latitude: center[1],
      longitude: center[0]
  };

  var km = radiusInKm;

  var ret = [];
  var distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180));
  var distanceY = km/110.574;

  var theta, x, y;
  for(var i=0; i<points; i++) {
      theta = (i/points)*(2*Math.PI);
      x = distanceX*Math.cos(theta);
      y = distanceY*Math.sin(theta);

      ret.push([coords.longitude+x, coords.latitude+y]);
  }
  ret.push(ret[0]);

  return [ret]
};