from rest_framework import serializers
from .models import File
from .models import FileResponse
class FileSerializer(serializers.ModelSerializer):
  class Meta():
    model = File
    fields = ('file', 'username', 'password', 'printer', 'timestamp')

#class FileResponseSerializer(serializers.ModelSerializer):
#  class Meta():
#    model = FileResponse
#    fields = ('rc', 'rs')

#class FileResponseSerializer(serializers.ModelSerializer):
class FileResponseSerializer(serializers.Serializer):
  rc = serializers.IntegerField(default=-2)
  rs = serializers.CharField(max_length=256,default='')

class CommentSerializer(serializers.Serializer):
    email = serializers.EmailField()
    content = serializers.CharField(max_length=200)
    created = serializers.DateTimeField()

class CS2(serializers.Serializer):
    rc = serializers.IntegerField(default=-2)
    rs = serializers.CharField(max_length=256,default='')

#class CS2(serializers.ModelSerializer):
#  class Meta():
#    model = FileResponse
#    fields = ('rc', 'rs')
