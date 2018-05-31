# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.

class File(models.Model):
  file = models.FileField(blank=False, null=False)
  username = models.CharField(max_length=64,default='')
  password = models.CharField(max_length=64,default='')
  printer = models.CharField(max_length=64,default='')
  timestamp = models.DateTimeField(auto_now_add=True)

class FileResponse(models.Model):
  rc = models.IntegerField(default=-2)
  rs = models.CharField(max_length=256,default='')
