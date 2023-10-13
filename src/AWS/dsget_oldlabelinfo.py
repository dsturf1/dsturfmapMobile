import pandas as pd
import re
import os
import numpy as np
import glob
from datetime import datetime
import geopandas as gpd
import json
from shapely.geometry import shape, GeometryCollection
from rasterio.plot import show
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm
from matplotlib import colors
from utils import FeatureExtraction, feature_matching, decimal_coords
from exif import Image as exifimg
from PIL import Image

import shutil
import rasterio
import cv2
import sys

def getInfo(filesGrp, img_path):

  dslabel = {
    "id":"",
    "11originalFileJPG":"",
    "11originalFileGrp":[],
    "GeoTagInfo":{
      "coords":[],
      "datetime_original":"",
      "gps_altitude":0,
      "gps_altitude_ref":""    
    },
    "label":[]
  }

# Remove Drive letter with root path
  dslabel['11originalFileJPG'] = img_path[3:]
  dslabel['11originalFileGrp'] = [x[3:] for x in filesGrp  if ('.JPG' not in x)]

  with open(img_path, 'rb') as src:
    img = exifimg(src)

  coords = [
    decimal_coords(img.gps_longitude,
    img.gps_longitude_ref),
      decimal_coords(img.gps_latitude,
    img.gps_latitude_ref)
  ]

  dslabel['id'] = img.datetime_original.replace(" ","").replace(":","") + "_{:.10f}".format(coords[0]).replace(".","") + "_{:.10f}".format(coords[1]).replace(".","") + "_{:f}".format(img.gps_altitude).replace(".","")
  dslabel['GeoTagInfo']['coords'] = coords
  dslabel['GeoTagInfo']['datetime_original'] = img.datetime_original
  dslabel['GeoTagInfo']['gps_altitude'] = img.gps_altitude
  dslabel['GeoTagInfo']['gps_altitude_ref'] = img.gps_altitude_ref
  
  return dslabel
    
  



def main(argv):

  src_folder = argv[1]
  print(src_folder)
  out_folder = r'D:\ToAWS2'

  
  course_list = ['청도','포항','중문','시흥','거창','속리산','춘천']

  course_ids = {
    '포항':'MGC001',
    '청도':'MGC002',
    '중문':'MGC003',
    '시흥':'MGC004',
    '거창':'MGC005',
    '속리산':'MGC006',
    '춘천':'MGC007'
  }

  logfile = open("err.log", "w")
  original_folder = []
  
  InfoJsonArray = []
  target_folder = []

  files = glob.glob(os.path.join(src_folder,'**/*.JPG'), recursive=True)
  files = [x for x in files if 'DJI' in x]

  for idx, file_ in enumerate(files):

    course = list(filter(lambda y: y in file_, course_list))[0]

    path = os.path.normpath(file_)
    info = path.split(os.sep)

    filesGrp = glob.glob(os.path.join(os.path.split(file_)[0],(('_').join(os.path.split(file_)[1].split('_')[:-2])[:-3]+"***_" + os.path.split(file_)[1].split('_')[-2]) + '*'), recursive=True)
    print(file_)
    file_info = getInfo(filesGrp, file_)

    file_info['label'] = {
      "level1":info[-3],
      "level2":info[-2],
      "level3":"",
      "TurfType":""
    }

    InfoJsonArray.append( file_info)
    
  #   print(save_name)

  #   print('{} out of {} files Completed'.format(idx, len(target_files)))

  save_name = os.path.join(out_folder, 'afterLabeldata'+course+'.json')
  with open(save_name, "w", encoding='utf-8') as final:
    json.dump(InfoJsonArray, final , ensure_ascii=False)


if __name__ == '__main__':
    main(sys.argv)