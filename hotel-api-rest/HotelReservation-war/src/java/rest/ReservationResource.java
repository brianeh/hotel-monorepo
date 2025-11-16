package rest;

import java.net.URI;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import javax.ejb.EJB;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import models.Reservation;
import models.Room;
import sessionbeans.ReservationFacadeLocal;
import sessionbeans.RoomFacadeLocal;

@Path("reservations")
public class ReservationResource {

    @EJB
    private ReservationFacadeLocal reservationFacade;

    @EJB
    private RoomFacadeLocal roomFacade;

    @GET
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public List<Reservation> getAllReservations() {
        return reservationFacade.findAll();
    }

    @GET
    @Path("{id}")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response getReservation(@PathParam("id") Integer id) {
        if (id == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Reservation reservation = reservationFacade.find(id);

        if (reservation == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(reservation).build();
    }

    @GET
    @Path("search")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response searchAvailability(@QueryParam("checkIn") String checkInStr,
            @QueryParam("checkOut") String checkOutStr) {
        if ((checkInStr == null) || (checkOutStr == null)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Both checkIn and checkOut parameters are required").build();
        }

        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date checkIn = sdf.parse(checkInStr);
            Date checkOut = sdf.parse(checkOutStr);

            List<Room> availableRooms = roomFacade.findAll();
            List<Reservation> reservations = reservationFacade.findAll();

            for (Reservation reservation : reservations) {
                if (hasDateConflict(checkIn, checkOut, reservation.getCheckInDate(), reservation.getCheckOutDate())) {
                    availableRooms.removeIf(room -> room.getId().equals(reservation.getIdRoom()));
                }
            }

            return Response.ok(availableRooms).build();

        } catch (ParseException e) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid data format.  Use yyyy-MM-dd").build();
        }
    }

    @POST
    @Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response createReservation(Reservation reservation) {
        try {
            reservationFacade.create(reservation);
            return Response.created(
                    URI.create("/api/reservations/" + reservation.getId())).entity(reservation).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @PUT
    @Path("{id}")
    @Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response updateReservation(@PathParam("id") Integer id, Reservation reservation) {
        try {
            reservation.setId(id);
            reservationFacade.edit(reservation);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @DELETE
    @Path("{id}")
    public Response cancelReservation(@PathParam("id") Integer id) {
        try {
            Reservation reservation = reservationFacade.find(id);
            if (reservation != null) {
                reservationFacade.remove(reservation);
            }
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    private boolean hasDateConflict(Date checkIn1, Date checkOut1, Date checkIn2, Date checkOut2) {
        return (checkIn1.before(checkOut2) && checkOut1.after(checkIn2));
    }
}
