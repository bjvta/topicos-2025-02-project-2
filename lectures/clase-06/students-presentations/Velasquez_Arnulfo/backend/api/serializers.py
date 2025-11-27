from rest_framework import serializers
from .models import Post, Publication

class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    publications = PublicationSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'titulo', 'contenido_original', 'fecha_creacion', 'publications']