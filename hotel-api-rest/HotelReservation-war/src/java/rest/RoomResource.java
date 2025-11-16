package rest;

import java.net.URI;
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
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import models.Room;
import sessionbeans.RoomFacadeLocal;

@Path("rooms")
public class RoomResource {

    @EJB
    private RoomFacadeLocal roomFacade;

    @GET
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public List<Room> getAllRooms() {
        return roomFacade.findAll();
    }

    @GET
    @Path("{id}")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response getRoom(@PathParam("id") Integer id) {
        if (id == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Room room = roomFacade.find(id);

        if (room == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(room).build();
    }

    @POST
    @Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response createRoom(Room room) {
        try {
            roomFacade.create(room);
            return Response.created(URI.create("/api/rooms/" + room.getId())).entity(room).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @PUT
    @Path("{id}")
    @Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response updateRoom(@PathParam("id") Integer id, Room room) {
        try {
            room.setId(id);
            roomFacade.edit(room);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @DELETE
    @Path("{id}")
    public Response deleteRoom(@PathParam("id") Integer id) {
        try {
            Room room = roomFacade.find(id);
            if (room != null) {
                roomFacade.remove(room);
            }

            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }
}
