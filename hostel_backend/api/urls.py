from django.urls import path

from . import views

app_name = "api"

urlpatterns = [
    # Hostels & rooms
    path("hostels/", views.HostelListView.as_view(), name="hostel-list"),
    path("hostels/<int:pk>/", views.HostelDetailView.as_view(), name="hostel-detail"),
    path("rooms/<int:pk>/", views.RoomDetailView.as_view(), name="room-detail"),

    # Bookings
    path("bookings/", views.BookingCreateView.as_view(), name="booking-create"),
    path("bookings/<int:pk>/", views.BookingDetailView.as_view(), name="booking-detail"),
    path("bookings/<int:pk>/status/", views.BookingStatusView.as_view(), name="booking-status"),
    path("bookings/<int:pk>/receipt/", views.ReceiptDownloadView.as_view(), name="booking-receipt"),

    # Payments (M-Pesa Daraja)
    path("payments/stk-push/", views.InitiateSTKPushView.as_view(), name="stk-push"),
    path("payments/mpesa/callback/", views.MpesaCallbackView.as_view(), name="mpesa-callback"),
]