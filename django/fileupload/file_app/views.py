# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
import subprocess
import os


# Create your views here.

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .serializers import FileSerializer
from .serializers import FileResponseSerializer
from .serializers import CommentSerializer
from .serializers import CS2

class FileUploadResponse(object):
    def __init__(self,rc, rs):
        self.rc = rc
        self.rs = rs

class C2(object):
    def __init__(self, rc, rs):
        self.rc = rc
        self.rs = rs

class Comment(object):
    def __init__(self, email, content, created=None):
        self.email = email
        self.content = content
        self.created = created 


class FileView(APIView):
  parser_classes = (MultiPartParser, FormParser)
  def post(self, request, *args, **kwargs):
    file_serializer = FileSerializer(data=request.data)
    if file_serializer.is_valid():
      file_serializer.save()
      print "1"
      print file_serializer
      print "2"
      print file_serializer.data
      print "3"
      BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
      print "4"
      print BASE_DIR
      print "5"
      print file_serializer.data["file"]
      print "6"
      print os.path.join(BASE_DIR, file_serializer.data["file"])
      print "7"

      argList=['groovix-web-printer', "--file", os.path.join(BASE_DIR, file_serializer.data["file"]) ]
      if  file_serializer.data["printer"] :
           argList +=["--printer",file_serializer.data["printer"] ]
      if  file_serializer.data["username"] :
           argList +=["--username",file_serializer.data["username"] ]
      if  file_serializer.data["password"] :
           argList +=["--password",file_serializer.data["password"] ]
        

      #myprocess=subprocess.Popen(execlist,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
      ##this will block until command exits
      #rm=myprocess.communicate()[0]
      #rc=myprocess.returncode
      myprocess = subprocess.Popen(argList,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
      print "polling"
      rs=myprocess.communicate()[0]
      rc = myprocess.returncode
      print rc
      print rs
      print "polling"

      #file_serializer.data["test"]="teststring"
      #file_serializer.data["rc"]=returnCode
      #file_serializer = FileSerializer(data=request.data)
      #file_serializer.data["password"]="newpass"
      #print file_serializer.data["password"]
      #rrc="2"
      #rrs="return string"
      #rdata={'rc': '2', 'rs': 'return string'}

      #comment = Comment(email='leila@example.com', content='foo bar')
      #serializer = CommentSerializer(comment)
      #print "C"
      #print serializer.data
      #print "C"

      comment2 = C2(rc, rs)
      file_response_serializer = CS2(comment2)
      print "C"
      print file_serializer.data
      print file_response_serializer.data
      print "C"

      #fileResponseObject=FileUploadResponse(rc=2,rs='ret str')
      #file_response_serializer = FileResponseSerializer(fileResponseObject)
      #if file_response_serializer.is_valid():
      #  print file_response_serializer.data
      #else:
      #  print file_response_serializer.errors

      #print "b"
      #print FileResponseObject
      #print FileResponseObject.rc
      #print "b"
      #file_response_serializer = FileResponseSerializer(data=rdata)


      #print file_serializer.data
      #print file_response_serializer.errors
      #print file_response_serializer.data

      return Response(file_response_serializer.data, status=status.HTTP_201_CREATED)


      if file_response_serializer.is_valid():
        print "a"
        print file_response_serializer.data
        print "a"
        #return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        return Response(file_response_serializer.data, status=status.HTTP_201_CREATED)
      else:
        print file_response_serializer.errors
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
      return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.conf.urls import url
from .views import FileView
urlpatterns = [
  url(r'^upload/$', FileView.as_view(), name='file-upload'),
]
