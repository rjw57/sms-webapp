from django import template
from rest_framework.authtoken.models import Token


register = template.Library()


@register.simple_tag(takes_context=True)
def user_token(context):
    """
    Render an authentication token for the current user (if not anonymous) or the empty string if
    the user is anonymous.

    """
    user = context['request'].user
    if user.is_anonymous:
        return ''
    return Token.objects.get_or_create(user=user)[0].key
