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
    "originalFileJPG":"",
    "originalFileGrp":[],
    "destFolder":"",
    "GeoTagInfo":{
      "coords":[],
      "datetime_original":"",
      "gps_altitude":0,
      "gps_altitude_ref":""    
    },
    "dest":{
      "rgb":"",
      "ndvi":"",
      "thumb":"",
    },
    "info":{
      "course":"",
      "area":"",
      "desc":"",
      "alt":""
    },
    "label":[],
    "annotation":[],
    "labelBy":""
  }

# Remove Drive letter with root path
  dslabel['originalFileJPG'] = img_path[3:]
  dslabel['originalFileGrp'] = [x[3:] for x in filesGrp  if ('.JPG' not in x)]

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


def getNDVIimg(filesGrp):


  with rasterio.open([ x for x in filesGrp if ('_MS_R' in x) ][0]) as src:
      band_red = src.read(1).astype(float)/65536.

  with rasterio.open([ x for x in filesGrp if ('_MS_NIR' in x) ][0]) as src:
      band_nir = src.read(1).astype(float)/65536.

  np.seterr(divide='ignore', invalid='ignore')

  # Calculate NDVI
  ndvi = (band_nir.astype(float) - band_red.astype(float)) / (band_nir.astype(float) + band_red.astype(float))

  ndvi -= ndvi.min() # ensure the minimal value is 0.0
  ndvi /= ndvi.max() # maximum value in image is now 1.0

  cm = plt.cm.get_cmap('RdYlGn')
  ndvi_cm = cm(ndvi)

  ndvi_img = cv2.normalize(ndvi_cm[:,:,:3], None, alpha = 0, beta = 255, norm_type = cv2.NORM_MINMAX, dtype = cv2.CV_32F).astype(np.uint8)

  return ndvi_img

def getalignedRGB(filesGrp_, ndvi_img):
  RGBimg = np.asarray(Image.open([x for x in filesGrp_ if 'JPG' in x][0]))

  # RGBimg = np.asarray(Image.open(filesGrp_[0]).resize((ndvi_img.shape[1],ndvi_img.shape[0])))
  # features0 = FeatureExtraction(RGBimg)
  # features1 = FeatureExtraction(ndvi_img)

  # matches = feature_matching(features0, features1)

  # print('{} number of matched has been found! in {}'.format(len(matches), filesGrp_[0]))

  # if len(matches) < 10:
  #    raise Exception("Not Enough Matches")

  # H, _ = cv2.findHomography( features0.matched_pts, features1.matched_pts, cv2.RANSAC, 5.0)

  H = np.array([[ 5.93209530e-01, -8.35074813e-03, -2.21474434e+02],
       [ 1.32198817e-02,  5.96460559e-01, -2.01042419e+02],
       [ 1.58520522e-06,  1.69424781e-06,  1.00000000e+00]])

  h, w, c = ndvi_img.shape
  RGBimg_tuned = cv2.warpPerspective(RGBimg, H, (w, h), borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))

  return RGBimg_tuned

def single_file_process(file_, idx,   target_folder, target_date, course, course_id, out_folder, logfile,InfoJsonArray):


  path = os.path.normpath(file_)
  info = path.split(os.sep)
  root_index = [idx for idx, s in enumerate(info) if 'NIA_2023_52_잔디' in s][0]
  area = info[root_index + 3]
  
  if len(info[root_index + 5].split('_')) ==3 :
    desc = info[root_index + 5].split('_')[-1] + '_0'
  else:
    desc = "미기재" + '_0'

  target_path = ('/').join([target_date,area,desc])

  while target_folder.count(target_path)>500:
    desc = desc.split('_')[0] + '_'+str(int(desc.split('_')[-1]) + 1)
    target_path = ('/').join([target_date,area,desc])

  target_folder.append(target_path)

  alt =  info[root_index + 4].split('_')[-1]


  filesGrp = glob.glob(os.path.join(os.path.split(file_)[0],(os.path.split(file_)[1].split('_')[0]+'_'+ 
    os.path.split(file_)[1].split('_')[1][:-3]+"***_" + os.path.split(file_)[1].split('_')[2]) + '*'), recursive=True)
  
  file_info = getInfo(filesGrp, file_)

  file_info['info']['course'] = course
  file_info['info']['area'] = area
  file_info['info']['alt'] = alt
  file_info['info']['desc'] = desc
  file_info['info']['date'] = target_date
  file_info['destFolder'] = target_path

  path_ = os.path.join(out_folder,course_id,target_date,area,desc,'rgb')

  if not os.path.exists(path_):
    os.makedirs(path_)

  path_ = os.path.join(out_folder,course_id,target_date,area,desc,'ndvi')

  if not os.path.exists(path_):
    os.makedirs(path_)

  path_ = os.path.join(out_folder,course_id,target_date,area,desc,'thumb')

  if not os.path.exists(path_):
    os.makedirs(path_)



  ndvi_img = getNDVIimg(filesGrp)
  rgb_img = getalignedRGB(filesGrp, ndvi_img)
  resized_ndvi = cv2.resize(ndvi_img, dsize=(648,486), interpolation=cv2.INTER_CUBIC)
  save_name = os.path.join(out_folder,course_id,target_date,area,desc,'ndvi','ndvi{}.JPG'.format( file_info['id']) )
  im = Image.fromarray(resized_ndvi)
  im.save(save_name)
  file_info['dest']['ndvi'] = os.path.join(course_id,target_date,area,desc,'ndvi','ndvi{}.JPG'.format( file_info['id']) )

  resized_rgb = cv2.resize(rgb_img , dsize=(2592,1944), interpolation=cv2.INTER_CUBIC)
  save_name = os.path.join(out_folder,course_id,target_date,area,desc,'rgb','rgb{}.JPG'.format( file_info['id']) )
  im = Image.fromarray(resized_rgb)
  im.save(save_name)
  file_info['dest']['rgb'] = os.path.join(course_id,target_date,area,desc,'rgb','rgb{}.JPG'.format( file_info['id']) )


  thumb_rgb = cv2.resize(rgb_img , dsize=(324,243), interpolation=cv2.INTER_CUBIC)
  save_name = os.path.join(out_folder,course_id,target_date,area,desc,'thumb','thumbrgb{}.JPG'.format( file_info['id']) )
  im = Image.fromarray(thumb_rgb)
  im.save(save_name)
  file_info['dest']['thumb'] = os.path.join(course_id,target_date,area,desc,'thumb','thumbrgb{}.JPG'.format( file_info['id']) )

  InfoJsonArray.append( file_info)
  print(save_name)

    
  



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
  

  
  files = glob.glob(os.path.join(src_folder,'**/DJI_*.JPG'), recursive=True)

  for file_ in files:
    path_ = os.path.normpath(file_)
    paths_ = path_.split(os.sep)
    root_index = [idx for idx, s in enumerate(paths_) if 'NIA_2023_52_잔디' in s][0]
    path_ = (os.sep).join(paths_[0:root_index+4])

    if path_ not in original_folder:
      original_folder.append(path_)

  print(original_folder)

  course = list(filter(lambda y: y in src_folder, course_list))[0]
  course_id = course_ids.get(course)

  for img_folder in original_folder:

    print("Start processing the "  + img_folder)

    path_ = os.path.normpath(img_folder).split(os.sep)
    root_index = [idx for idx, s in enumerate(path_) if 'NIA_2023_52_잔디' in s][0]

    target_date = ('').join(path_[-2].split('_')[:2])
    area = path_[-1]

    InfoJsonArray = []
    target_folder = []

    target_files = glob.glob(os.path.join(img_folder,'**/DJI_*.JPG'), recursive=True)

    for idx, file_ in enumerate(target_files):
      try:
        single_file_process(file_, idx, target_folder, target_date, course,course_id, out_folder, logfile, InfoJsonArray)
        print('{} out of {} files Completed'.format(idx, len(target_files)))
      except Exception as e:
        print("{} file Error".format(idx) + str(e))
        logfile.write("{} file Error".format(idx) +'('+file_+')'+ str(e))
        continue

    save_name = os.path.join(out_folder,course_id,target_date,area, 'data'+target_date+area+'.json')
    with open(save_name, "w", encoding='utf-8') as final:
      json.dump(InfoJsonArray, final , ensure_ascii=False)


if __name__ == '__main__':
    main(sys.argv)