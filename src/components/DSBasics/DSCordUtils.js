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
return path_;
}

export function ds_mgrData2geojson(mgr_){
  var path_ = []
  for (const p of mgr_) {
    path_.push([p.x,p.y])
  }
return path_;
};